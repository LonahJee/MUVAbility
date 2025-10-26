import { SignInOrUpForm } from "app";
import { useNavigate } from "react-router-dom";
import { Navbar } from "components/Navbar";
import { toast } from "sonner";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  
  // Handle authentication errors
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get("error");
    
    if (error) {
      switch(error) {
        case "auth/invalid-email":
          toast.error("Invalid email address");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password");
          break;
        case "auth/user-not-found":
          toast.error("User not found");
          break;
        case "auth/too-many-requests":
          toast.error("Too many attempts. Please try again later.");
          break;
        default:
          toast.error("Authentication failed. Please try again.");
      }
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to access your personalized exercise guidance</p>
          </div>
          
          <SignInOrUpForm signInOptions={{ google: true, emailAndPassword: true }} />
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>By signing in, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
