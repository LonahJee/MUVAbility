import databutton as db
import pandas as pd
from fastapi import APIRouter, HTTPException, status
import firebase_admin
from firebase_admin import credentials, firestore
import json
import numpy as np

router = APIRouter()

# --- Firebase Initialization ---
FIRESTORE_AVAILABLE = False
try:
    service_account_info = json.loads(db.secrets.get("FIREBASE_SERVICE_ACCOUNT"))
    cred = credentials.Certificate(service_account_info)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    FIRESTORE_AVAILABLE = True
except (json.JSONDecodeError, KeyError, TypeError) as e:
    print(f"Could not initialize Firebase Admin SDK: {e}")


# --- Data Processing Helper ---
def process_text_to_list(value):
    """Converts a string to a cleaned list of strings."""
    if not isinstance(value, str) or value.lower() in ['none', 'body only', 'n/a']:
        return []
    # Split by comma and strip whitespace from each item
    return [item.strip() for item in value.split(',') if item.strip()]

@router.post("/seed-firestore-exercises", summary="Seed Firestore with Validated Exercises", status_code=status.HTTP_201_CREATED)
def seed_firestore_exercises():
    """
    Reads exercise data from a CSV, validates and transforms it against a strict schema,
    clears the 'exercises' collection, and repopulates it with clean data.
    """
    if not FIRESTORE_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not available. Check secret configuration.",
        )

    firestore_client = firestore.client()
    exercises_ref = firestore_client.collection('exercises')

    # 1. Read and Clean CSV data
    try:
        df = db.storage.dataframes.get("refined-mobility-friendly-exercises-csv")
        if df.empty:
            raise HTTPException(status_code=404, detail="CSV file not found or is empty.")
        
        # Drop unnecessary columns identified in validation
        df.drop(columns=['Unnamed: 0.1', 'Unnamed: 0', 'Rating', 'RatingDesc'], inplace=True, errors='ignore')
        
        # Replace numpy NaN with None for Firestore compatibility
        df = df.where(pd.notnull(df), None)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read or clean CSV: {e}")

    # 2. Rename columns to match the new schema contract
    column_mapping = {
        'Title': 'name',
        'Desc': 'description',
        'Type': 'type',
        'BodyPart': 'targetAreas',
        'Equipment': 'equipment',
        'Level': 'difficulty'
    }
    df.rename(columns=column_mapping, inplace=True)

    # 3. Transform data to conform to the schema
    transformed_records = []
    for record in df.to_dict('records'):
        # Ensure lowercase for filterable fields
        if record.get('type'):
            record['type'] = record['type'].lower()
        if record.get('difficulty'):
            record['difficulty'] = record['difficulty'].lower()
        
        # Apply robust list conversion for equipment and targetAreas
        record['equipment'] = process_text_to_list(record.get('equipment'))
        record['targetAreas'] = process_text_to_list(record.get('targetAreas'))
        
        transformed_records.append(record)

    # 4. Clear existing data in the 'exercises' collection
    try:
        docs = exercises_ref.stream()
        batch = firestore_client.batch()
        deleted_count = 0
        for doc in docs:
            batch.delete(doc.reference)
            deleted_count += 1
        if deleted_count > 0:
            batch.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear 'exercises' collection: {e}")

    # 5. Migrate clean data to Firestore
    try:
        batch = firestore_client.batch()
        for record in transformed_records:
            doc_ref = exercises_ref.document()
            batch.set(doc_ref, record)
        batch.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to migrate data to Firestore: {e}")

    return {"message": f"Successfully cleared {deleted_count} docs and seeded {len(transformed_records)} new, validated exercises."}
