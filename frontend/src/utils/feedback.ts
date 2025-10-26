import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebase';

export interface FeedbackData {
  userId: string;
  exerciseName: string;
  recommendationText: string;
  type: "helpfulness" | "difficulty";
  value: "helpful" | "not_helpful" | "too_easy" | "just_right" | "too_hard";
}


export const submitFeedback = async (feedbackData: FeedbackData) => {
  try {
    const feedbackCollection = collection(db, 'feedback');
    await addDoc(feedbackCollection, {
      ...feedbackData,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred." };
  }
};
