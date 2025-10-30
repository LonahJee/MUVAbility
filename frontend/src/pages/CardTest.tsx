import React from 'react';
import ExerciseCard from 'components/ExerciseCard'; // Corrected import
import { Exercise } from 'utils/types';

const CardTest = () => {
  
  const testExercise: Exercise = {
    id: "test-001",
    name: "Isolated Test: Elastic Band Row",
    description: "This is a test to see if the card renders an image with a valid URL.",
    type: "strength",
    targetAreas: ["upper body"],
    equipment: ["Resistance bands"],
    difficulty: "medium",
    imageUrl: "https://static.databutton.com/public/1de8a77d-dcb0-4ab1-a7bf-91056580efbe/20250919_2224_Elastic%20Band%20Row%20Exercise_simple_compose_01k5jexr1sf41rd12cka7y7qbe.png"
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ExerciseCard Isolation Test</h1>
      <p className="mb-6">
        This page displays a single ExerciseCard with hardcoded data to verify its rendering behavior.
        If the image below is visible, the component is working correctly.
      </p>
      <div className="max-w-sm">
        <ExerciseCard 
          exercise={testExercise} 
          onClick={() => alert("Card clicked!")} 
        />
      </div>
    </div>
  );
};

export default CardTest;
