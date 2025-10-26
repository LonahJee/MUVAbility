import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  addDoc,
  Timestamp,
  getFirestore, // FIX: Import the getFirestore function
} from "firebase/firestore";
import { firebaseApp } from "app"; // FIX: Import the initialized Firebase app
import {
  WorkoutLog,
  ExerciseLog,
  ProgressStats,
  ExerciseProgress,
  calculateImprovement,
} from "./progressTypes";

const WORKOUT_LOGS_COLLECTION = "workoutLogs";
const db = getFirestore(firebaseApp); // FIX: Get the Firestore instance correctly

// Add a new workout log
export const addWorkoutLog = async (
  workoutData: Omit<WorkoutLog, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    const workoutCollection = collection(db, WORKOUT_LOGS_COLLECTION);

    const workoutLog = {
      ...workoutData,
      date: Timestamp.fromDate(new Date(workoutData.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(workoutCollection, workoutLog);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding workout log:", error);
    return { success: false, error };
  }
};

// Update an existing workout log
export const updateWorkoutLog = async (logId: string, workoutData: Partial<WorkoutLog>): Promise<{ success: boolean; error?: any }> => {
  try {
    const workoutRef = doc(db, WORKOUT_LOGS_COLLECTION, logId);
    
    // Format date if it's present
    const updates: any = {
      ...workoutData,
      updatedAt: Timestamp.now()
    };
    
    if (updates.date && updates.date instanceof Date) {
      updates.date = updates.date.toISOString();
    }
    
    await updateDoc(workoutRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating workout log:', error);
    return { success: false, error };
  }
};

// Delete a workout log
export const deleteWorkoutLog = async (logId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const workoutRef = doc(db, WORKOUT_LOGS_COLLECTION, logId);
    await deleteDoc(workoutRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting workout log:', error);
    return { success: false, error };
  }
};

// Get a single workout log by ID
export const getWorkoutLog = async (logId: string): Promise<{ success: boolean; log?: WorkoutLog; error?: any }> => {
  try {
    const workoutRef = doc(db, WORKOUT_LOGS_COLLECTION, logId);
    const workoutSnap = await getDoc(workoutRef);
    
    if (workoutSnap.exists()) {
      const data = workoutSnap.data();
      const log: WorkoutLog = {
        id: workoutSnap.id,
        ...data,
        date: data.date // Keep as ISO string
      } as WorkoutLog;
      
      return { success: true, log };
    } else {
      return { success: false, error: 'Workout log not found' };
    }
  } catch (error) {
    console.error('Error getting workout log:', error);
    return { success: false, error };
  }
};

// Get all workout logs for a user
export async function getUserWorkoutLogs(
  userId: string
): Promise<{ success: boolean; logs?: WorkoutLog[]; error?: any }> {
  try {
    const logsCollection = collection(db, WORKOUT_LOGS_COLLECTION);
    const q = query(
      logsCollection,
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure date is always a JS Date object in the app
        date: (data.date as Timestamp).toDate(),
      } as WorkoutLog;
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Error getting workout logs:", error);
    return { success: false, error };
  }
};

// Get progress stats for a user
export const getUserProgressStats = async (userId: string): Promise<{ 
  success: boolean; 
  stats?: ProgressStats;
  error?: any 
}> => {
  try {
    const logs = await getUserWorkoutLogs(userId);
    
    if (!logs.success || !logs.logs || logs.logs.length === 0) {
      return { 
        success: true, 
        stats: {
          currentStreak: 0,
          longestStreak: 0,
          totalWorkouts: 0,
          lastWorkoutDate: null,
          exerciseProgress: []
        }
      };
    }
    
    // Sort logs by date (newest first)
    const sortedLogs = [...logs.logs].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Calculate streaks
    const streakData = calculateStreaks(sortedLogs);
    
    // Calculate exercise progress
    const exerciseProgress = calculateExerciseProgress(sortedLogs);
    
    const stats: ProgressStats = {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalWorkouts: sortedLogs.length,
      lastWorkoutDate: sortedLogs.length > 0 ? new Date(sortedLogs[0].date) : null,
      exerciseProgress
    };
    
    return { success: true, stats };
  } catch (error) {
    console.error('Error getting progress stats:', error);
    return { success: false, error };
  }
};

// Helper function to calculate streaks
const calculateStreaks = (logs: WorkoutLog[]): { currentStreak: number; longestStreak: number } => {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Convert all dates to local date strings to handle date comparisons properly
  const workoutDates = logs.map(log => {
    const date = new Date(log.date);
    return date.toLocaleDateString();
  });
  
  // Remove duplicate dates (if more than one workout on the same day)
  const uniqueDates = [...new Set(workoutDates)];
  
  // Sort dates (newest first)
  uniqueDates.sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
  
  // Check if there's a workout today or yesterday to start the streak calculation
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
    
    // Calculate the rest of the streak
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      const prevDate = new Date(uniqueDates[i]);
      
      // Check if the dates are consecutive
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i - 1]);
    const prevDate = new Date(uniqueDates[i]);
    
    // Check if the dates are consecutive
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Ensure current streak doesn't exceed longest streak
  currentStreak = Math.min(currentStreak, longestStreak);
  
  return { currentStreak, longestStreak };
};

// Helper function to calculate exercise progress
const calculateExerciseProgress = (logs: WorkoutLog[]): ExerciseProgress[] => {
  if (logs.length === 0) return [];
  
  const exerciseMap = new Map<string, ExerciseProgress>();
  
  // Process each log
  logs.forEach(log => {
    const logDate = new Date(log.date);
    
    log.exercises.forEach(exercise => {
      if (!exerciseMap.has(exercise.exerciseId)) {
        // Initialize with the first encounter
        exerciseMap.set(exercise.exerciseId, {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          firstLog: {
            date: logDate,
            maxWeight: getMaxWeight(exercise),
            maxReps: getMaxReps(exercise),
            maxDuration: getMaxDuration(exercise),
            maxDistance: getMaxDistance(exercise)
          },
          lastLog: {
            date: logDate,
            maxWeight: getMaxWeight(exercise),
            maxReps: getMaxReps(exercise),
            maxDuration: getMaxDuration(exercise),
            maxDistance: getMaxDistance(exercise)
          },
          improvement: {
            weight: 0,
            reps: 0,
            duration: 0,
            distance: 0
          }
        });
      } else {
        // Update existing entry
        const existingProgress = exerciseMap.get(exercise.exerciseId)!;
        
        // Check if this is a more recent log
        if (logDate > existingProgress.lastLog.date) {
          existingProgress.lastLog = {
            date: logDate,
            maxWeight: getMaxWeight(exercise),
            maxReps: getMaxReps(exercise),
            maxDuration: getMaxDuration(exercise),
            maxDistance: getMaxDistance(exercise)
          };
        }
        
        // Check if this is an earlier log
        if (logDate < existingProgress.firstLog.date) {
          existingProgress.firstLog = {
            date: logDate,
            maxWeight: getMaxWeight(exercise),
            maxReps: getMaxReps(exercise),
            maxDuration: getMaxDuration(exercise),
            maxDistance: getMaxDistance(exercise)
          };
        }
        
        // Update improvement calculations
        const improvement = {
          weight: calculateImprovement(
            existingProgress.firstLog.maxWeight || 0, 
            existingProgress.lastLog.maxWeight || 0
          ),
          reps: calculateImprovement(
            existingProgress.firstLog.maxReps || 0, 
            existingProgress.lastLog.maxReps || 0
          ),
          duration: calculateImprovement(
            existingProgress.firstLog.maxDuration || 0, 
            existingProgress.lastLog.maxDuration || 0
          ),
          distance: calculateImprovement(
            existingProgress.firstLog.maxDistance || 0, 
            existingProgress.lastLog.maxDistance || 0
          )
        };
        
        existingProgress.improvement = improvement;
        exerciseMap.set(exercise.exerciseId, existingProgress);
      }
    });
  });
  
  return Array.from(exerciseMap.values());
};

// Helper functions to get max values from sets
const getMaxWeight = (exercise: ExerciseLog): number => {
  if (!exercise.sets || exercise.sets.length === 0) return 0;
  return Math.max(...exercise.sets.map(set => set.weight || 0));
};

const getMaxReps = (exercise: ExerciseLog): number => {
  if (!exercise.sets || exercise.sets.length === 0) return 0;
  return Math.max(...exercise.sets.map(set => set.reps || 0));
};

const getMaxDuration = (exercise: ExerciseLog): number => {
  if (!exercise.sets || exercise.sets.length === 0) return 0;
  return Math.max(...exercise.sets.map(set => set.duration || 0));
};

const getMaxDistance = (exercise: ExerciseLog): number => {
  if (!exercise.sets || exercise.sets.length === 0) return 0;
  return Math.max(...exercise.sets.map(set => set.distance || 0));
};
