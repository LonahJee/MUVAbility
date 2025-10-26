// Types for workout tracking and progress monitoring

export interface WorkoutLog {
  id: string;
  userId: string;
  date: Date | string; // ISO string when storing/retrieving
  exercises: ExerciseLog[];
  notes?: string;
  overallFeeling?: OverallFeeling;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes?: string;
  difficulty?: number; // 1-5 rating
  painLevel?: number; // 0-10 rating
  modifications?: string;
}

export interface ExerciseSet {
  reps?: number;
  weight?: number; // in lbs or kg
  duration?: number; // in seconds
  distance?: number; // in meters
  resistanceLevel?: number; // for bands, machines
  completed: boolean;
}

export type OverallFeeling = 'great' | 'good' | 'okay' | 'tired' | 'pain';

export const overallFeelingOptions: OverallFeeling[] = ['great', 'good', 'okay', 'tired', 'pain'];

export interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  lastWorkoutDate: Date | null;
  exerciseProgress: ExerciseProgress[];
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  firstLog: {
    date: Date;
    maxWeight?: number;
    maxReps?: number;
    maxDuration?: number;
    maxDistance?: number;
  };
  lastLog: {
    date: Date;
    maxWeight?: number;
    maxReps?: number;
    maxDuration?: number;
    maxDistance?: number;
  };
  improvement: {
    weight?: number; // Percentage increase
    reps?: number; // Percentage increase
    duration?: number; // Percentage increase
    distance?: number; // Percentage increase
  };
}

// Format functions
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatFeeling = (feeling: OverallFeeling): string => {
  const feelings: Record<OverallFeeling, string> = {
    great: 'Great',
    good: 'Good',
    okay: 'Okay',
    tired: 'Tired',
    pain: 'In Pain'
  };
  return feelings[feeling];
};

export const calculateImprovement = (first: number, last: number): number => {
  if (!first || first === 0) return 0;
  return Number((((last - first) / first) * 100).toFixed(1));
};
