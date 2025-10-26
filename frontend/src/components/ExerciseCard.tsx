import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "utils/types";
import { Heart, Dumbbell } from "lucide-react";
import useFavoritesStore from "utils/favoritesStore";
import { useCurrentUser } from "app";

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const { user } = useCurrentUser();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const isFavorite = user ? favoriteIds.includes(exercise.id) : false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    if (user) {
      toggleFavorite(user.uid, exercise.id);
    }
  };

  return (
    <Card 
      className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200"
    >
      <CardHeader>
        {exercise.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-t-lg">
            <img 
              src={exercise.imageUrl} 
              alt={exercise.name}
              className="w-full h-96 object-contain transition-transform duration-300 ease-in-out hover:scale-105"
            />
          </div>
        )}
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{exercise.name}</CardTitle>
          <button
            onClick={handleFavoriteClick}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Toggle Favorite"
          >
            <Heart
              className={`h-6 w-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`}
            />
          </button>
        </div>
        <CardDescription className="text-sm text-gray-600 pt-2">{exercise.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="h-5 w-5 text-gray-600" />
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {exercise.equipment.join(', ')}
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {exercise.targetAreas && Array.isArray(exercise.targetAreas) && (
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {exercise.targetAreas.join(', ').replace(/_/g, ' ')}
            </span>
          )}
          {exercise.type && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {exercise.type}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-4 flex flex-wrap gap-2">
        {exercise.difficulty && (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default ExerciseCard;
