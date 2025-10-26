import { useState, useEffect } from "react";
import { useUserGuardContext } from "app";
import { useNavigate } from "react-router-dom";
import { Navbar } from "components/Navbar";
import { toast } from "sonner";
import { getUserProfile, createUserProfile, MobilityProfile } from "utils/firebase";

interface FormState {
  mobilityCondition: string;
  conditionDetails: string;
  movementLimitations: string[];
  assistiveDevices: string[];
  exerciseGoals: string[];
  preferredExerciseTypes: string[];
  painAreas: string[];
}

const MOBILITY_CONDITIONS = [
  "Wheelchair user",
  "Amputation",
  "Cerebral palsy",
  "Multiple sclerosis",
  "Stroke",
  "Spinal cord injury",
  "Arthritis",
  "Muscular dystrophy",
  "Parkinson's disease",
  "Temporary injury",
  "Other"
];

const MOVEMENT_LIMITATIONS = [
  "Limited arm mobility",
  "Limited leg mobility",
  "Limited trunk/core mobility",
  "Balance issues",
  "Coordination difficulties",
  "Reduced grip strength",
  "Limited range of motion",
  "Fatigue with movement",
  "Pain with certain movements"
];

const ASSISTIVE_DEVICES = [
  "Wheelchair (manual)",
  "Wheelchair (electric)",
  "Walker",
  "Cane",
  "Crutches",
  "Prosthetic limb",
  "Orthotic device",
  "None",
  "Other"
];

const EXERCISE_GOALS = [
  "Improve cardiovascular health",
  "Increase strength",
  "Improve flexibility",
  "Increase endurance",
  "Weight management",
  "Pain reduction",
  "Improve balance",
  "Improve coordination",
  "Maintain current abilities",
  "Rehabilitation from injury"
];

const EXERCISE_TYPES = [
  "Seated exercises",
  "Water exercises/swimming",
  "Resistance training",
  "Stretching/flexibility",
  "Cardiovascular training",
  "Balance exercises",
  "Yoga/modified yoga",
  "Tai chi",
  "Physical therapy exercises"
];

const PAIN_AREAS = [
  "Neck",
  "Shoulders",
  "Back (upper)",
  "Back (lower)",
  "Arms",
  "Elbows",
  "Wrists/hands",
  "Hips",
  "Knees",
  "Ankles/feet",
  "Joints (general)",
  "Legs"
];

export default function UserProfileSetup() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    mobilityCondition: "",
    conditionDetails: "",
    movementLimitations: [],
    assistiveDevices: [],
    exerciseGoals: [],
    preferredExerciseTypes: [],
    painAreas: []
  });

  // Load existing profile data if it exists
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const { success, profile } = await getUserProfile(user.uid);
        
        if (success && profile) {
          setFormState({
            mobilityCondition: profile.mobilityCondition || "",
            conditionDetails: profile.conditionDetails || "",
            movementLimitations: profile.movementLimitations || [],
            assistiveDevices: profile.assistiveDevices || [],
            exerciseGoals: profile.exerciseGoals || [],
            preferredExerciseTypes: profile.preferredExerciseTypes || [],
            painAreas: profile.painAreas || []
          });
          setHasExistingProfile(true);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user.uid]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category: keyof FormState, value: string) => {
    if (category === "mobilityCondition" || category === "conditionDetails") return;
    
    setFormState(prev => {
      const currentValues = prev[category] as string[];
      
      if (currentValues.includes(value)) {
        // Remove the value if it's already selected
        return {
          ...prev,
          [category]: currentValues.filter(item => item !== value)
        };
      } else {
        // Add the value if it's not selected
        return {
          ...prev,
          [category]: [...currentValues, value]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.mobilityCondition) {
      toast.error("Please select a mobility condition");
      return;
    }

    if (formState.exerciseGoals.length === 0) {
      toast.error("Please select at least one exercise goal");
      return;
    }

    try {
      setIsLoading(true);
      const toastId = toast.loading("Saving your profile...");
      
      const profileData: Omit<MobilityProfile, 'userId' | 'createdAt' | 'updatedAt'> = {
        mobilityCondition: formState.mobilityCondition,
        conditionDetails: formState.conditionDetails,
        movementLimitations: formState.movementLimitations,
        assistiveDevices: formState.assistiveDevices,
        exerciseGoals: formState.exerciseGoals,
        preferredExerciseTypes: formState.preferredExerciseTypes,
        painAreas: formState.painAreas
      };
      
      console.log('Submitting profile data:', profileData);
      const { success, error } = await createUserProfile(user.uid, profileData);
      
      toast.dismiss(toastId);
      
      if (success) {
        toast.success("Profile saved successfully!");
        // Redirect to profile page after a short delay
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        console.error('Profile save failed:', error);
        toast.error(`Failed to save profile: ${error}`);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("An error occurred while saving your profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">{hasExistingProfile ? "Update Your Profile" : "Complete Your Profile"}</h2>
            <p className="text-gray-600 mt-2">
              Help us understand your mobility needs so we can provide personalized exercise recommendations.
            </p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mobility Condition */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  What is your primary mobility condition?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOBILITY_CONDITIONS.map((condition) => (
                    <label key={condition} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="mobilityCondition"
                        value={condition}
                        checked={formState.mobilityCondition === condition}
                        onChange={handleTextChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
  
              {/* Condition Details */}
              {formState.mobilityCondition && (
                <div>
                  <label htmlFor="conditionDetails" className="block text-lg font-medium text-gray-700 mb-3">
                    Please provide more details about your condition (optional)
                  </label>
                  <textarea
                    id="conditionDetails"
                    name="conditionDetails"
                    value={formState.conditionDetails}
                    onChange={handleTextChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your specific situation, including duration, severity, etc."
                  ></textarea>
                </div>
              )}
  
              {/* Movement Limitations */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  What movement limitations do you experience? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOVEMENT_LIMITATIONS.map((limitation) => (
                    <label key={limitation} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formState.movementLimitations.includes(limitation)}
                        onChange={() => handleCheckboxChange("movementLimitations", limitation)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{limitation}</span>
                    </label>
                  ))}
                </div>
              </div>
  
              {/* Assistive Devices */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Do you use any assistive devices? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ASSISTIVE_DEVICES.map((device) => (
                    <label key={device} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formState.assistiveDevices.includes(device)}
                        onChange={() => handleCheckboxChange("assistiveDevices", device)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{device}</span>
                    </label>
                  ))}
                </div>
              </div>
  
              {/* Exercise Goals */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  What are your exercise goals? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXERCISE_GOALS.map((goal) => (
                    <label key={goal} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formState.exerciseGoals.includes(goal)}
                        onChange={() => handleCheckboxChange("exerciseGoals", goal)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
  
              {/* Preferred Exercise Types */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  What types of exercises are you interested in? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXERCISE_TYPES.map((type) => (
                    <label key={type} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formState.preferredExerciseTypes.includes(type)}
                        onChange={() => handleCheckboxChange("preferredExerciseTypes", type)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
  
              {/* Pain Areas */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Do you experience pain in any of these areas? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PAIN_AREAS.map((area) => (
                    <label key={area} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formState.painAreas.includes(area)}
                        onChange={() => handleCheckboxChange("painAreas", area)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>
  
              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : hasExistingProfile ? "Update Profile" : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
