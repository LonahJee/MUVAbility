-import { useState } from "react";
import { Exercise, formatDifficulty, formatMobilityType, formatTargetArea } from "utils/exerciseTypes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: Props) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const viewExerciseDetails = () => {
    navigate(`/ExerciseDetail?id=${exercise.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full h-48 overflow-hidden bg-slate-100">
        {!imageError && exercise.imageUrl ? (
          <img 
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-400 text-lg">No image available</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="font-medium">
            {formatDifficulty(exercise.difficulty)}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl line-clamp-1">{exercise.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {exercise.description.substring(0, 100)}{exercise.description.length > 100 ? '...' : ''}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.mobilityType.map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {formatMobilityType(type)}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {exercise.targetAreas.map((area) => (
            <Badge key={area} variant="outline" className="bg-slate-50 text-xs">
              {formatTargetArea(area)}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          onClick={viewExerciseDetails} 
          variant="default" 
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
