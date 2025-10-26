import {
  AssessRiskV2Data,
  AssessRiskV2Error,
  ChatCompletionsData,
  ChatCompletionsError,
  ChatRequest,
  CheckHealthData,
  RiskAssessmentV2Request,
  SeedFirestoreExercisesData,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Reads exercise data from a CSV, validates and transforms it against a strict schema, clears the 'exercises' collection, and repopulates it with clean data.
   *
   * @tags dbtn/module:data_migration, dbtn/hasAuth
   * @name seed_firestore_exercises
   * @summary Seed Firestore with Validated Exercises
   * @request POST:/routes/seed-firestore-exercises
   */
  seed_firestore_exercises = (params: RequestParams = {}) =>
    this.request<SeedFirestoreExercisesData, any>({
      path: `/routes/seed-firestore-exercises`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name chat_completions
   * @summary Chat Completions
   * @request POST:/routes/completions
   */
  chat_completions = (data: ChatRequest, params: RequestParams = {}) =>
    this.request<ChatCompletionsData, ChatCompletionsError>({
      path: `/routes/completions`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Receives cardiovascular risk factors and returns a mock assessment.
   *
   * @tags dbtn/module:risk_assessment, dbtn/hasAuth
   * @name assess_risk_v2
   * @summary Assess Risk V2
   * @request POST:/routes/assess-risk-v2
   */
  assess_risk_v2 = (data: RiskAssessmentV2Request, params: RequestParams = {}) =>
    this.request<AssessRiskV2Data, AssessRiskV2Error>({
      path: `/routes/assess-risk-v2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
