import {
  AssessRiskV2Data,
  ChatCompletionsData,
  ChatRequest,
  CheckHealthData,
  RiskAssessmentV2Request,
  SeedFirestoreExercisesData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Reads exercise data from a CSV, validates and transforms it against a strict schema, clears the 'exercises' collection, and repopulates it with clean data.
   * @tags dbtn/module:data_migration, dbtn/hasAuth
   * @name seed_firestore_exercises
   * @summary Seed Firestore with Validated Exercises
   * @request POST:/routes/seed-firestore-exercises
   */
  export namespace seed_firestore_exercises {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SeedFirestoreExercisesData;
  }

  /**
   * No description
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name chat_completions
   * @summary Chat Completions
   * @request POST:/routes/completions
   */
  export namespace chat_completions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ChatCompletionsData;
  }

  /**
   * @description Receives cardiovascular risk factors and returns a mock assessment.
   * @tags dbtn/module:risk_assessment, dbtn/hasAuth
   * @name assess_risk_v2
   * @summary Assess Risk V2
   * @request POST:/routes/assess-risk-v2
   */
  export namespace assess_risk_v2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RiskAssessmentV2Request;
    export type RequestHeaders = {};
    export type ResponseBody = AssessRiskV2Data;
  }
}
