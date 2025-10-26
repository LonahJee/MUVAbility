import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import { getUserProfile } from "utils/firebase";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [showAiAssistantButton, setShowAiAssistantButton] = useState(false);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        try {
          const { success, profile } = await getUserProfile(user.uid);
          // A simple check if profile exists and has some data.
          // This can be made more specific if needed.
          if (success && profile && Object.keys(profile).length > 0) {
            setShowAiAssistantButton(true);
          } else {
            setShowAiAssistantButton(false);
          }
        } catch (error) {
          console.error("Error checking user profile for AI Assistant button:", error);
          setShowAiAssistantButton(false);
        }
      } else {
        setShowAiAssistantButton(false);
      }
    };

    checkUserProfile();
  }, [user]);

  const handleProfileClick = async () => {
    if (!user) return navigate('/login');
    
    try {
      const { success, profile } = await getUserProfile(user.uid);
      if (success && profile) {
        navigate('/profile');
      } else {
        navigate('/user-profile-setup');
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      navigate('/user-profile-setup');
    }
  };

  return (
    <header className="container mx-auto px-6 py-6 flex justify-between items-center">
      <div 
        className="flex items-center space-x-2 cursor-pointer" 
        onClick={() => navigate("/")}
      >
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
          <path d="M16 10h4a2 2 0 0 1 0 4h-4" />
          <circle cx="8" cy="12" r="7" />
          <path d="M8 8v8" />
          <path d="M5 12h6" />
        </svg>
        <h1 className="text-2xl font-bold text-blue-700">MÜVAbility</h1>
      </div>
      
      <nav className="flex-1 ml-8">
        <ul className="flex space-x-6">
          <li>
            <button 
              onClick={() => navigate('/ExerciseLibrary')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Exercise Library
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/ProgressTracker')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Progress Tracker
            </button>
          </li>
          <li>
            <button onClick={() => navigate("/CardiovascularRisk")}>
              Cardiovascular Risk Assessment
            </button>
            </li>
          {showAiAssistantButton && (
            <li>
              <button 
                onClick={() => navigate('/profile')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                AI Assistant
              </button>
            </li>
          
          )}
        </ul>
      </nav>

      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Hi, {user.displayName || user.email?.split('@')[0] || 'User'}</span>
          <button 
            onClick={handleProfileClick}
            className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            My Profile
          </button>
          <button 
            onClick={() => navigate('/logout')}
            className="px-4 py-2 rounded-full text-blue-600 font-medium hover:bg-blue-50 transition-colors"
          >
            Sign Out
          </button>
          <button 
            onClick={() => navigate('/user-profile-setup')}
            className="px-4 py-2 rounded-full text-blue-600 font-medium hover:bg-blue-50 transition-colors"
          >
            Retake
          </button>
        </div>
      ) : (
        <button 
          onClick={() => navigate('/login')}
          className="px-4 py-2 rounded-full text-blue-600 font-medium hover:bg-blue-50 transition-colors"
        >
          Sign In
        </button>
      )}
    </header>
  );
};
