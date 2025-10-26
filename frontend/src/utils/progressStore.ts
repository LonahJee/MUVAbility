import { create } from 'zustand';
import { WorkoutLog, ProgressStats, ExerciseLog } from './progressTypes';
import { 
  addWorkoutLog, 
  updateWorkoutLog, 
  deleteWorkoutLog, 
  getUserWorkoutLogs, 
  getUserProgressStats 
} from './progressFirestore';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
} from "firebase/firestore";

interface ProgressState {
  // Workout logs
  workoutLogs: WorkoutLog[];
  selectedWorkoutLog: WorkoutLog | null;
  isLoading: boolean;
  error: string | null;
  
  // Progress stats
  progressStats: ProgressStats | null;
  
  // User ID
  userId: string | null;

  // Current workout log being edited
  currentWorkout: Partial<WorkoutLog> | null;
  streak: number;

  // Actions
  setUserId: (userId: string) => void;
  fetchWorkoutLogs: (userId: string) => Promise<void>;
  fetchProgressStats: (userId: string) => Promise<void>;
  getWorkoutLog: (logId: string) => WorkoutLog | undefined;
  
  // Workout log actions
  startNewWorkout: () => void;
  updateCurrentWorkout: (data: Partial<WorkoutLog>) => void;
  addExerciseToWorkout: (exercise: ExerciseLog) => void;
  updateExerciseInWorkout: (exerciseIndex: number, updatedExercise: ExerciseLog) => void;
  removeExerciseFromWorkout: (exerciseIndex: number) => void;
  
  // Save and delete actions
  saveWorkout: () => Promise<boolean>;
  deleteWorkout: (logId: string) => Promise<boolean>;
  calculateStreak: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state
  workoutLogs: [],
  selectedWorkoutLog: null,
  isLoading: false,
  error: null,
  progressStats: null,
  currentWorkout: null,
  userId: null,
  streak: 0,
  
  // Set User ID
  setUserId: (userId: string) => set({ userId }),
  
  // Data fetching
  fetchWorkoutLogs: async (userId: string) => {
    set({ isLoading: true, error: null, userId });
    
    try {
      const { success, logs, error } = await getUserWorkoutLogs(userId);
      
      if (success && logs) {
        set({ workoutLogs: logs, isLoading: false });
      } else {
        set({ error: String(error), isLoading: false });
      }
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },
  
  fetchProgressStats: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { success, stats, error } = await getUserProgressStats(userId);
      
      if (success && stats) {
        set({ progressStats: stats, isLoading: false });
      } else {
        set({ error: String(error), isLoading: false });
      }
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },
  
  getWorkoutLog: (logId: string) => {
    return get().workoutLogs.find(log => log.id === logId);
  },
  
  // Current workout management
  startNewWorkout: () => {
    set({
      currentWorkout: {
        date: new Date(),
        exercises: [],
        overallFeeling: 'good'
      }
    });
  },
  
  updateCurrentWorkout: (data: Partial<WorkoutLog>) => {
    set(state => ({
      currentWorkout: {
        ...state.currentWorkout,
        ...data
      }
    }));
  },
  
  addExerciseToWorkout: (exercise: ExerciseLog) => {
    set(state => {
      if (!state.currentWorkout) return { currentWorkout: null };
      
      const exercises = [...(state.currentWorkout.exercises || [])];
      exercises.push(exercise);
      
      return {
        currentWorkout: {
          ...state.currentWorkout,
          exercises
        }
      };
    });
  },
  
  updateExerciseInWorkout: (index: number, exercise: Partial<ExerciseLog>) => {
    set(state => {
      if (!state.currentWorkout || !state.currentWorkout.exercises) {
        return { currentWorkout: state.currentWorkout };
      }
      
      const exercises = [...state.currentWorkout.exercises];
      exercises[index] = {
        ...exercises[index],
        ...exercise
      };
      
      return {
        currentWorkout: {
          ...state.currentWorkout,
          exercises
        }
      };
    });
  },
  
  removeExerciseFromWorkout: (exerciseId: string) => {
    set(state => {
      if (!state.currentWorkout || !state.currentWorkout.exercises) {
        return { currentWorkout: state.currentWorkout };
      }
      
      const exercises = [...state.currentWorkout.exercises];
      const index = exercises.findIndex(exercise => exercise.id === exerciseId);
      if (index !== -1) {
        exercises.splice(index, 1);
      }
      
      return {
        currentWorkout: {
          ...state.currentWorkout,
          exercises
        }
      };
    });
  },
  
  // Save and delete actions
  saveWorkout: async () => {
    console.log("saveWorkout in store called");
    const { currentWorkout, userId } = get();
    console.log("User ID:", userId);
    console.log("Current Workout:", currentWorkout);
    if (!userId || !currentWorkout) {
      console.error("Save aborted: Missing userId or currentWorkout");
      return false;
    }

    set({ isLoading: true });

    // Use a temporary ID for the key, then let firestore create the real one
    const finalWorkout: Omit<WorkoutLog, "createdAt" | "updatedAt"> = {
      id: currentWorkout.id || doc(collection(getFirestore(), "temp")).id,
      userId: userId,
      date: new Date(currentWorkout.date).toISOString(),
      exercises: currentWorkout.exercises,
      notes: currentWorkout.notes,
      overallFeeling: currentWorkout.overallFeeling,
    };
    
    console.log("Calling addWorkoutLog with:", finalWorkout);
    const { success, error } = await addWorkoutLog(finalWorkout);
    console.log("addWorkoutLog response:", { success, error });
    
    if (success) {
      console.log("Save successful, fetching new data...");
      await get().fetchWorkoutLogs(userId);
      await get().fetchProgressStats(userId);
      get().startNewWorkout(); // Reset for the next one
      set({ isLoading: false });
      return true;
    } else {
      set({ error: String(error), isLoading: false });
      return false;
    }
  },
  
  deleteWorkout: async (logId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { success, error } = await deleteWorkoutLog(logId);
      
      if (success) {
        // Update state
        set(state => ({
          workoutLogs: state.workoutLogs.filter(log => log.id !== logId),
          isLoading: false
        }));
        
        // Refresh progress stats for the updated user
        const userId = get().workoutLogs.find(log => log.id === logId)?.userId;
        if (userId) {
          await get().fetchProgressStats(userId);
        }
        
        return true;
      } else {
        set({ error: String(error), isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: String(error), isLoading: false });
      return false;
    }
  },
  
  calculateStreak: () => {
    const { workoutLogs } = get();
    if (workoutLogs.length === 0) {
      set({ streak: 0 });
      return;
    }

    // Create a set of unique dates (YYYY-MM-DD) from the logs
    const workoutDates = new Set(
      workoutLogs.map(log => {
        const date = new Date(log.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      })
    );

    let currentStreak = 0;
    const today = new Date();

    // Check if today is a workout day
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (workoutDates.has(todayStr)) {
      currentStreak = 1;
    }

    // Check for consecutive days backwards from yesterday
    for (let i = 1; i < workoutLogs.length + 1; i++) {
      const dateToCheck = new Date();
      dateToCheck.setDate(today.getDate() - i);
      const dateStr = `${dateToCheck.getFullYear()}-${String(dateToCheck.getMonth() + 1).padStart(2, '0')}-${String(dateToCheck.getDate()).padStart(2, '0')}`;
      
      if (workoutDates.has(dateStr)) {
        if(currentStreak > 0) currentStreak++; // only increment if we have a streak from today
        else if (i===1) currentStreak = 1; // start streak from yesterday if today is not a workout day
      } else {
        // if today is not a workout day and yesterday is not, streak must be 0
        if (i===1 && currentStreak === 0) {
            set({ streak: 0 });
            return;
        }
        break; // Streak is broken
      }
    }
    
    set({ streak: currentStreak });
  }
}));
