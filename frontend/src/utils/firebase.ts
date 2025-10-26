import { firebaseApp } from "app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Initialize Firestore
export const db = getFirestore(firebaseApp);

// User Profile Types
export interface MobilityProfile {
  userId: string;
  mobilityCondition: string;
  conditionDetails?: string;
  movementLimitations: string[];
  assistiveDevices: string[];
  exerciseGoals: string[];
  preferredExerciseTypes: string[];
  painAreas?: string[];
  createdAt: any; // Can be Date or Firestore Timestamp
  updatedAt: any; // Can be Date or Firestore Timestamp
}

// Create a new user profile
export const createUserProfile = async (userId: string, profileData: Omit<MobilityProfile, 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    
    // Use Firestore server timestamp instead of Date objects
    const newProfile = {
      userId,
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Log what we're trying to save to help with debugging
    console.log('Saving profile data:', JSON.stringify(newProfile));
    
    await setDoc(profileRef, newProfile);
    return { success: true, profile: newProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Get a user profile
export const getUserProfile = async (userId: string) => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return { success: true, profile: profileSnap.data() as MobilityProfile };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
};

// Update an existing user profile
export const updateUserProfile = async (userId: string, profileData: Partial<Omit<MobilityProfile, 'userId' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    
    const updates = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(profileRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};
