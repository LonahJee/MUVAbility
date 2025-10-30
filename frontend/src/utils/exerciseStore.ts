

import { create } from 'zustand';
import { Exercise, ExerciseFilter, MobilityType, Difficulty, TargetArea } from './exerciseTypes';
import { getExercises, getExercise, seedExercises } from './exerciseFirestore';

interface ExerciseState {
  // Exercises data
  exercises: Exercise[];
  selectedExercise: Exercise | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filter: ExerciseFilter;
  
  // Actions
  fetchExercises: (filter?: ExerciseFilter) => Promise<void>;
  fetchExerciseById: (id: string) => Promise<void>;
  setFilter: (filter: Partial<ExerciseFilter>) => void;
  clearFilters: () => void;
  initializeExercises: () => Promise<void>;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  exercises: [],
  selectedExercise: null,
  isLoading: false,
  error: null,
  filter: {},
  
  // Actions
  fetchExercises: async (filter?: ExerciseFilter) => {
    set({ isLoading: true, error: null });
    
    try {

      const filterToUse = filter || get().filter;
      const { success, exercises, error } = await getExercises(filterToUse);
      
      if (success && exercises) {
        set({ exercises, isLoading: false });
      } else {
        const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to fetch exercises";
        set({ error: errorMessage, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message || "An unknown error occurred", isLoading: false });
    }
  },

  fetchExerciseById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { success, exercise, error } = await getExercise(id);
      
      if (success && exercise) {
        set({ selectedExercise: exercise, isLoading: false });
      } else {
        const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to fetch exercise by ID";
        set({ error: errorMessage, isLoading: false, selectedExercise: null });
      }
    } catch (error) {
      set({ error: error.message || "An unknown error occurred", isLoading: false, selectedExercise: null });
    }
  },

  setFilter: (partialFilter: Partial<ExerciseFilter>) => {
    
    const newFilter = { ...get().filter, ...partialFilter };
    set({ filter: newFilter });
    
    
    get().fetchExercises(newFilter);
  },
  
  clearFilters: () => {
    set({ filter: {} });
    get().fetchExercises({});
  },
  
  initializeExercises: async () => {
    set({ isLoading: true, error: null });
    
    try {

      await seedExercises();
      
      
      const { success, exercises, error } = await getExercises();
      
      if (success && exercises) {
        set({ exercises, isLoading: false });
      } else {
        const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to initialize exercises";
        set({ error: errorMessage, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message || "An unknown error occurred", isLoading: false });
    }
  }
}));
