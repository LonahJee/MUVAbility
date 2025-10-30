// Exercise data types for the exercise library

export type MobilityType = 
  | 'wheelchair'
  | 'limited_standing'
  | 'seated'
  | 'limited_range_of_motion'
  | 'ambulatory_aid_users'
  | 'balance_concerns'
  | 'all';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type TargetArea = 
  | 'upper_body' 
  | 'core' 
  | 'lower_body' 
  | 'cardiovascular' 
  | 'flexibility' 
  | 'balance'
  | 'strength'
  | 'dexterity';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  benefits: string;
  mobilityType: MobilityType[];
  difficulty: Difficulty;
  equipment: string[];
  modifications: string;
  targetAreas: TargetArea[];
  types?: string;
  imageUrl?: string;
    videoUrl: string;
}

export interface ExerciseFilter {
  mobilityType?: MobilityType;
  difficulty?: Difficulty;
  targetArea?: TargetArea;
  searchTerm?: string;
  type?: string;
}


export const formatMobilityType = (type: MobilityType): string => {
  const formattedTypes: Record<MobilityType, string> = {
    wheelchair: 'Wheelchair Users',
    limited_standing: 'Limited Standing',
    seated: 'Seated Exercises',
    limited_range_of_motion: 'Limited Range of Motion',
    ambulatory_aid_users: 'Ambulatory Aid Users',
    balance_concerns: 'Balance Concerns',
    all: 'All Mobility Types'
  };
  return formattedTypes[type];
};

export const formatDifficulty = (difficulty: Difficulty): string => {
  const formattedDifficulties: Record<Difficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Challenging'
  };
  return formattedDifficulties[difficulty];
};

export const formatTargetArea = (area: TargetArea): string => {
  const formattedAreas: Record<TargetArea, string> = {
    upper_body: 'Upper Body',
    core: 'Core',
    lower_body: 'Lower Body',
    cardiovascular: 'Cardiovascular',
    flexibility: 'Flexibility',
    balance: 'Balance',
    strength: 'Strength',
    dexterity: 'Dexterity'
  };
  return formattedAreas[area];
};
