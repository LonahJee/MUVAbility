import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import { Navbar } from "components/Navbar";

export default function App() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-12 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Exercise Guidance Tailored for Your Mobility Needs</h2>
            <p className="text-xl text-gray-600 mb-8">MÜVAbility helps people with mobility disorders find appropriate exercises and programs that accommodate their specific needs.</p>
            <button 
              onClick={() => user ? navigate('/user-profile-setup') : navigate('/login')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full text-lg hover:bg-blue-700 transition-colors shadow-md mx-auto"
            >
              Get Started
            </button>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
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
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                  <path d="M12 4v12" />
                  <path d="M8 9h8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalized Exercise Recommendations</h3>
              <p className="text-gray-600">Get exercise suggestions tailored to your specific mobility conditions and limitations.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Guidance & Modifications</h3>
              <p className="text-gray-600">Learn adaptations and modifications to make standard exercises work for your abilities.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
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
                  <path d="M12 2v8" />
                  <path d="m4.93 10.93 1.41 1.41" />
                  <path d="M2 18h2" />
                  <path d="M20 18h2" />
                  <path d="m19.07 10.93-1.41 1.41" />
                  <path d="M22 22H2" />
                  <path d="m16 6-4 4-4-4" />
                  <path d="M16 18a4 4 0 0 0-8 0" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Track your exercise journey and celebrate improvements in strength, flexibility, and cardiovascular health.</p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How MÜVAbility Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">1</div>
                <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
                <p className="text-gray-600">Tell us about your mobility condition, limitations, and exercise goals.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">2</div>
                <h3 className="text-xl font-semibold mb-3">Ask Our Exercise Chatbot</h3>
                <p className="text-gray-600">Get personalized recommendations from our AI-powered exercise assistant.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">3</div>
                <h3 className="text-xl font-semibold mb-3">Start Moving Safely</h3>
                <p className="text-gray-600">Follow your customized exercise plan and track your progress over time.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-50 rounded-2xl p-8 mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to improve your mobility?</h2>
            <p className="text-gray-600 mb-6">Join MÜVAbility today and discover exercises that work for your body.</p>
            <button 
              onClick={() => !user && navigate('/login')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-md"
            >
              {user ? 'Go to Dashboard' : 'Create Your Free Account'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
