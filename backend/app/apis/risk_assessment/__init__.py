from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import databutton as db
import pandas as pd
import numpy as np
import joblib
import io
from tensorflow.keras.models import load_model, model_from_json
import zipfile
from sklearn.preprocessing import StandardScaler

router = APIRouter()

# Corrected Request Model - must match frontend call
class RiskAssessmentV2Request(BaseModel):
    age: int
    gender: int
    chest_pain_type: int
    systolic_bp: int
    cholesterol: int
    fasting_blood_sugar: int
    resting_ekg: int
    max_heart_rate: int
    exercise_induced_angina: int
    oldpeak: float
    slope: int
    num_major_vessels: int

# Corrected Response Model - to match frontend display
class RiskAssessmentResponse(BaseModel):
    risk_probability: float
    has_heart_disease: bool

# --- Load Artifacts ---
try:
    preprocessor_bytes = db.storage.binary.get("preprocessor-joblib")
    preprocessor = joblib.load(io.BytesIO(preprocessor_bytes))
    print("Preprocessor loaded successfully in risk_assessment.")
except Exception as e:
    print(f"CRITICAL: Failed to load preprocessor in risk_assessment. Error: {e}")
    preprocessor = None

try:
    model_zip_bytes = db.storage.binary.get("regularized-model-keras")
    
    with zipfile.ZipFile(io.BytesIO(model_zip_bytes), 'r') as zip_ref:
        arch_json = None
        weights_h5 = None
        
        # Find architecture and weights files
        for name in zip_ref.namelist():
            if name.endswith('.json'):
                arch_json = zip_ref.read(name)
            elif name.endswith('.h5'):
                # Extract weights file to a temp path to be loaded
                zip_ref.extract(name, path="/tmp/")
                weights_h5_path = f"/tmp/{name}"

        if arch_json and weights_h5_path:
            print("Found architecture and weights files in ZIP.")
            # Load model from architecture
            model = model_from_json(arch_json.decode('utf-8'))
            # Load weights into model
            model.load_weights(weights_h5_path)
            print("Keras model successfully loaded from arch and weights.")
        else:
            print("CRITICAL: Architecture (.json) or weights (.h5) not found in ZIP.")
            model = None

except Exception as e:
    print(f"CRITICAL: Failed to load Keras model from arch/weights. Error: {e}")
    model = None


@router.post("/assess-risk-v2", response_model=RiskAssessmentResponse)
def assess_risk_v2(body: RiskAssessmentV2Request):
    """
    ASSESS RISK V2 - FEATURE LIST (25 FEATURES)
    This endpoint manually constructs the 25-feature vector required by the Keras model.
    The order is critical and must match the training script.

    NUMERIC FEATURES (10):
    1.  num__age
    2.  num__gender
    3.  num__restingBP
    4.  num__serumcholestrol
    5.  num__fastingbloodsugar
    6.  num__maxheartrate
    7.  num__exerciseangia
    8.  num__oldpeak
    9.  num__noofmajorvessels
    10. num__age_maxheartrate_interaction

    CATEGORICAL FEATURES (15 - One-Hot Encoded):
    11. cat__chestpain_0
    12. cat__chestpain_1
    13. cat__chestpain_2
    14. cat__chestpain_3
    15. cat__restingrelectro_0
    16. cat__restingrelectro_1
    17. cat__restingrelectro_2
    18. cat__slope_0
    19. cat__slope_1
    20. cat__slope_2
    21. cat__slope_3
    22. cat__oldpeak_binned_0
    23. cat__oldpeak_binned_1
    24. cat__oldpeak_binned_2
    25. cat__oldpeak_binned_3
    """
    if not model:
        raise HTTPException(
            status_code=500,
            detail="Model not loaded. Check server logs."
        )

    final_df = None
    try:
        # --- Manually build the 25-feature vector from scratch based on training script ---

        # 1. Create DataFrame with correct names from the model's training
        input_df = pd.DataFrame([{
            'age': body.age,
            'gender': body.gender,
            'restingBP': body.systolic_bp,
            'serumcholestrol': body.cholesterol,
            'fastingbloodsugar': body.fasting_blood_sugar,
            'maxheartrate': body.max_heart_rate,
            'exerciseangia': body.exercise_induced_angina,
            'oldpeak': body.oldpeak,
            'noofmajorvessels': body.num_major_vessels,
            'chestpain': body.chest_pain_type,
            'restingrelectro': body.resting_ekg,
            'slope': body.slope,
        }])

        # 2. Create interaction and binned features
        input_df['age_maxheartrate_interaction'] = input_df['age'] * input_df['maxheartrate']
        
        bins = [-float('inf'), 1.0, 2.0, 3.0, float('inf')]
        labels = [0,1,2,3]
        input_df['oldpeak_binned'] = pd.cut(input_df['oldpeak'], bins=bins, labels=labels, right=False).astype(int)

        # 3. Separate Numeric and Categorical, then Scale Numeric
        numeric_cols = [
            'age', 'gender', 'restingBP', 'serumcholestrol', 'fastingbloodsugar', 
            'maxheartrate', 'exerciseangia', 'oldpeak', 'noofmajorvessels', 
            'age_maxheartrate_interaction'
        ]
        numeric_df = input_df[numeric_cols]

        # Apply standard scaling to numeric features
        scaler = StandardScaler()
        scaled_numeric_data = scaler.fit_transform(numeric_df)
        scaled_numeric_df = pd.DataFrame(scaled_numeric_data, columns=[f"num__{col}" for col in numeric_cols])

        # 4. One-Hot Encode Categorical Features
        final_vector_df = scaled_numeric_df
        cat_map = {
            'chestpain': ('cat__chestpain', 4),
            'restingrelectro': ('cat__restingrelectro', 3),
            'slope': ('cat__slope', 4),
            'oldpeak_binned': ('cat__oldpeak_binned', 4)
        }

        for col, (prefix, num_classes) in cat_map.items():
            for i in range(num_classes):
                final_vector_df[f"{prefix}_{i}"] = (input_df[col] == i).astype(int)
        
        # 5. Ensure order is correct
        final_feature_order = [
            'num__age', 'num__gender', 'num__restingBP', 'num__serumcholestrol', 'num__fastingbloodsugar',
            'num__maxheartrate', 'num__exerciseangia', 'num__oldpeak', 'num__noofmajorvessels',
            'num__age_maxheartrate_interaction',
            'cat__chestpain_0', 'cat__chestpain_1', 'cat__chestpain_2', 'cat__chestpain_3',
            'cat__restingrelectro_0', 'cat__restingrelectro_1', 'cat__restingrelectro_2',
            'cat__slope_0', 'cat__slope_1', 'cat__slope_2', 'cat__slope_3',
            'cat__oldpeak_binned_0', 'cat__oldpeak_binned_1', 'cat__oldpeak_binned_2', 'cat__oldpeak_binned_3'
        ]
        # Ensure all columns exist, fill with 0 if not (for safety)
        for col in final_feature_order:
            if col not in final_vector_df:
                final_vector_df[col] = 0
        
        final_vector_df = final_vector_df[final_feature_order]
        
        final_df = final_vector_df # For logging
        final_feature_vector = final_vector_df.to_numpy()

        if final_feature_vector.shape[1] != 25:
             raise ValueError(f"Incorrect final feature vector shape. Expected 25, got {final_feature_vector.shape[1]}")

        prediction = model.predict(final_feature_vector)
        risk_probability = float(prediction[0][0])
        has_disease = risk_probability >= 0.5

        return RiskAssessmentResponse(
            risk_probability=risk_probability,
            has_heart_disease=has_disease
        )
    finally:
        if final_df is not None:
            print("\n--- final_df from assess_risk_v2 ---")
            print(final_df.to_string())
