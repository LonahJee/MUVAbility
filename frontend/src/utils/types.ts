// ui/src/utils/types.ts

/**
 * Defines the strict data structure for an Exercise document in Firestore.
 * This serves as a contract between the backend migration script and the
 * frontend components.
 */
export interface Exercise {
  id: string; // Document ID from Firestore
  name: string;
  description: string;
  type: string | null;
  targetAreas: string[] | null; 
  equipment: string[] | null; // This MUST be an array of strings
  difficulty: string | null;
}
