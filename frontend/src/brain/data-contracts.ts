/** ChatRequest */
export interface ChatRequest {
  /** Messages */
  messages: Message[];
  profile?: ProfileInfo | null;
  /**
   * Max Tokens
   * @default 500
   */
  max_tokens?: number | null;
  /**
   * Model
   * @default "gpt-3.5-turbo"
   */
  model?: string | null;
}

/** ChatResponse */
export interface ChatResponse {
  message: Message;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** Message */
export interface Message {
  /** Role */
  role: string;
  /** Content */
  content: string;
}

/** ProfileInfo */
export interface ProfileInfo {
  /** Mobilitycondition */
  mobilityCondition?: string | null;
  /** Conditiondetails */
  conditionDetails?: string | null;
  /** Movementlimitations */
  movementLimitations?: string[] | null;
  /** Assistivedevices */
  assistiveDevices?: string[] | null;
  /** Exercisegoals */
  exerciseGoals?: string[] | null;
  /** Preferredexercisetypes */
  preferredExerciseTypes?: string[] | null;
  /** Painareas */
  painAreas?: string[] | null;
}

/** RiskAssessmentResponse */
export interface RiskAssessmentResponse {
  /** Message */
  message: string;
  /** Risk Score */
  risk_score: number;
  /** Disclaimer */
  disclaimer: string;
}

/** RiskAssessmentV2Request */
export interface RiskAssessmentV2Request {
  /** Age */
  age: number;
  /**
   * Gender
   * 0=female, 1=male
   */
  gender: number;
  /**
   * Chest Pain Type
   * 0-3
   */
  chest_pain_type: number;
  /** Systolic Bp */
  systolic_bp: number;
  /** Cholesterol */
  cholesterol: number;
  /**
   * Fasting Blood Sugar
   * 0=false, 1=true
   */
  fasting_blood_sugar: number;
  /**
   * Resting Ekg
   * 0-2
   */
  resting_ekg: number;
  /** Max Heart Rate */
  max_heart_rate: number;
  /**
   * Exercise Induced Angina
   * 0=no, 1=yes
   */
  exercise_induced_angina: number;
  /** Oldpeak */
  oldpeak: number;
  /**
   * Slope
   * 1-3
   */
  slope: number;
  /**
   * Num Major Vessels
   * 0-3
   */
  num_major_vessels: number;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type SeedFirestoreExercisesData = any;

export type ChatCompletionsData = ChatResponse;

export type ChatCompletionsError = HTTPValidationError;

export type AssessRiskV2Data = RiskAssessmentResponse;

export type AssessRiskV2Error = HTTPValidationError;
