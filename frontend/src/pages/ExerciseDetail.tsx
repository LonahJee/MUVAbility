import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useExerciseStore } from "utils/exerciseStore";
import { formatDifficulty, formatMobilityType, formatTargetArea } from "utils/exerciseTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import ReactPlayer from "react-player";


export default function ExerciseDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedExercise, isLoading, error, fetchExerciseById } = useExerciseStore();
  const location = useLocation();

  const exerciseId = searchParams.get("id");

  useEffect(() => {
    if (exerciseId) {
      fetchExerciseById(exerciseId);
    }
  }, [exerciseId, fetchExerciseById]);

  const handleBackClick = () => {
    const from = location.state?.from || "/";
    navigate(from);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !selectedExercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Button variant="outline" onClick={handleBackClick} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
          
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Exercise Not Found</h2>
            <p className="mb-4">{error || "The exercise you're looking for couldn't be found."}</p>
            <Button onClick={handleBackClick}>Return to Exercise Library</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackClick} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {selectedExercise.imageUrl && (
            <div className="w-full h-64 md:h-80 bg-slate-100 relative">
              <img 
                src={selectedExercise.imageUrl} 
                alt={selectedExercise.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="font-medium text-sm">
                  {formatDifficulty(selectedExercise.difficulty)}
                </Badge>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-800">
              {selectedExercise.name}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedExercise.mobilityType.map((type) => (
                <Badge key={type} variant="outline" className="text-sm">
                  {formatMobilityType(type)}
                </Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-slate-700">Description</h2>
                <p className="text-slate-600">{selectedExercise.description}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2 text-slate-700">Benefits</h2>
                <p className="text-slate-600">{selectedExercise.benefits}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-slate-700">Modifications</h2>
              <p className="text-slate-600">{selectedExercise.modifications}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-slate-700">Target Areas</h2>
                <div className="flex flex-wrap gap-1">
                  {selectedExercise.targetAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="bg-slate-100 text-slate-800 font-normal mr-1 mb-1">
                      {formatTargetArea(area)}
                    </Badge>
                  ))}
                      {/* VIDEO PLAYER */}
              {selectedExercise.videoUrl && (
              <div className="mb-6">
                <ReactPlayer
                  url={selectedExercise.videoUrl}
                  controls
                  width="100%"
                  height="360px"
                />
              </div>
              )}
                  
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2 text-slate-700">Equipment Needed</h2>
                {selectedExercise.equipment.length > 0 ? (
                  <ul className="list-disc pl-5 text-slate-600">
                    {selectedExercise.equipment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600">No equipment required</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
