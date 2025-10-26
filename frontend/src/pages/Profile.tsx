import { useState } from "react";
import React from "react"
import { useUserGuardContext } from "app";
import { Navbar } from "components/Navbar";
import { toast } from "sonner";
import { useEffect } from "react";
import { getUserProfile } from "utils/firebase";
import { useNavigate } from "react-router-dom";
import brain from "brain";
import { submitFeedback } from "utils/feedback";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Profile() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profile, setProfile] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, boolean>>({});

  // Check if user has completed their profile
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { success, profile } = await getUserProfile(user.uid);
        if (success && profile) {
          setProfile(profile); // Store the full profile data
        }
        setHasProfile(success && profile);
      } catch (error) {
        console.error("Error checking profile:", error);
        setHasProfile(false);
      }
    };
    checkProfile();
  }, [user.uid]);
/*
  // If profile check is complete and user has no profile, redirect to profile setup
  useEffect(() => {
    if (hasProfile === false) {
      toast.error("Please complete your profile to get personalized recommendations");
      navigate("/user-profile-setup");
    }
  }, [hasProfile, navigate]);
  */
  const handleFeedback = async (
    index: number,
    type: "helpfulness" | "difficulty",
    value: "helpful" | "not_helpful" | "too_easy" | "just_right" | "too_hard"
  ) => {
    const recommendation = chatHistory[index];
    if (!recommendation || recommendation.role !== "assistant") return;

    await submitFeedback({
      userId: user.uid,
      exerciseName: "General Recommendation", // Or parse from content
      recommendationText: recommendation.content,
      type,
      value,
    });

    setFeedbackGiven((prev) => ({ ...prev, [index]: true }));
    toast.success("Thank you for your feedback!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    const newUserMessage = { role: "user", content: message };
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);
    
    // Clear input
    setMessage("");
    
    // Show loading toast
    const toastId = toast.loading("Getting your exercise recommendations...");
    
    // Make an API call to OpenAI
    setTimeout(async () => {
      try {
        // Call our secure backend API instead of directly calling OpenAI
        const response = await brain.chat_completions({
          messages: [
            ...chatHistory, // Include chat history for context
            newUserMessage, // Add the new user message
          ],
          profile: profile, // Send the user's mobility profile
          max_tokens: 500, // Limit response length
          model: "gpt-3.5-turbo" // or "gpt-4" for a more expensive option
        });
        
        const data = await response.json();
        
        const aiResponse = { 
          role: "assistant", 
          content: data.message.content
        };
        
        setChatHistory([...updatedChatHistory, aiResponse]);
        toast.dismiss(toastId);
        toast.success("Got recommendations!");
      } catch (error) {
        console.error("API error:", error);
        toast.dismiss(toastId);
        toast.error("Failed to get AI response. Please try again.");
        
        // Fallback to a default response
        const fallbackResponse = { 
          role: "assistant", 
          content: "I'm sorry, I'm having trouble generating a recommendation right now. Please try again in a moment."
        };
        setChatHistory([...updatedChatHistory, fallbackResponse]);
      }
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <Navbar />

      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Your Exercise Assistant</h2>
            <p className="text-gray-600 mt-2">Ask me about exercises that can accommodate your mobility needs.</p>
          </div>
          
          <div className="overflow-y-auto p-6" style={{ height: "600px" }}>
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-blue-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Start the conversation</h3>
                <p className="text-gray-600">
                  Ask about exercises for specific mobility concerns, or get recommendations for a workout routine that accommodates your needs.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                  <React.Fragment key={index}>
                    <div
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="w-6 h-6 text-blue-600"
                            >
                              <path d="M16 10h4a2 2 0 0 1 0 4h-4" />
                              <circle cx="8" cy="12" r="7" />
                              <path d="M8 8v8" />
                              <path d="M5 12h6" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                        style={{ maxWidth: "75%" }}
                      >
                        {msg.role === "user" ? (
                          <p>{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none prose-li:list-disc">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                    {msg.role === 'assistant' && !feedbackGiven[index] && (
                      <div className="flex justify-start ml-16 mb-4 space-x-2">
                         <p className="text-sm text-gray-500 mr-2">Was this helpful?</p>
                        <Button variant="outline" size="sm" onClick={() => handleFeedback(index, 'helpfulness', 'helpful')}>👍</Button>
                        <Button variant="outline" size="sm" onClick={() => handleFeedback(index, 'helpfulness', 'not_helpful')}>👎</Button>
                        <div className="border-l mx-2"></div>
                         <p className="text-sm text-gray-500 mr-2">Difficulty?</p>
                        <Button variant="outline" size="sm" onClick={() => handleFeedback(index, 'difficulty', 'too_easy')}>Too Easy</Button>
                        <Button variant="outline" size="sm" onClick={() => handleFeedback(index, 'difficulty', 'just_right')}>Just Right</Button>
                        <Button variant="outline" size="sm" onClick={() => handleFeedback(index, 'difficulty', 'too_hard')}>Too Hard</Button>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about exercises for your mobility needs..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
