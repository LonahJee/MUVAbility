import React, { useState, useEffect } from "react";
import { useUserGuardContext } from "app";
import { useProgressStore } from "utils/progressStore";
import { useExerciseStore } from "utils/exerciseStore";
import { Exercise } from "utils/exerciseTypes";
import { ExerciseLog, ExerciseSet, OverallFeeling, formatFeeling, overallFeelingOptions } from "utils/progressTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export const WorkoutLogForm: React.FC = () => {
  const {
    currentWorkout,
    updateCurrentWorkout,
    addExerciseToWorkout,
    updateExerciseInWorkout,
    removeExerciseFromWorkout,
    saveWorkout,
    isLoading,
  } = useProgressStore();
  const { exercises, isLoading: exercisesLoading } = useExerciseStore();
  
  const handleSave = async () => {
    const success = await saveWorkout();
    if (success) {
      toast.success("Workout saved successfully!");
    }
  };

  const handleAddExercise = () => {
    // Replace with a modal to select from an exercise library
    addExerciseToWorkout({
      id: `ex-${Date.now()}`,
      exerciseId: "temp-id",
      exerciseName: "New Exercise",
      sets: [{ reps: 0, weight: 0 }],
    });
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string
  ) => {
    if (!currentWorkout || !currentWorkout.exercises) return;
    const newSets = [...currentWorkout.exercises[exerciseIndex].sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: parseFloat(value) };
    updateExerciseInWorkout(exerciseIndex, { sets: newSets });
  };

  if (!currentWorkout) {
    return <div>Loading workout...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a Workout</CardTitle>
        <CardDescription>
          Track your exercises to see your progress over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label>Date</label>
          <Input
            type="date"
            value={
              currentWorkout.date
                ? new Date(currentWorkout.date).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              updateCurrentWorkout({
                date: new Date(e.target.value),
              })
            }
          />
        </div>

        {currentWorkout.exercises?.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Select
                value={exercise.exerciseName}
                onValueChange={(value) => {
                  const selectedExerciseObject = exercises.find(ex => ex.name === value);
                  updateExerciseInWorkout(exerciseIndex, {
                    exerciseName: value,
                    exerciseId: selectedExerciseObject ? selectedExerciseObject.id : "",
                  });
                }}
              >
                <SelectTrigger className="text-lg font-semibold">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercisesLoading ? (
                    <SelectItem value="loading" disabled>Loading exercises...</SelectItem>
                  ) : (
                    exercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.name}>
                        {ex.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExerciseFromWorkout(exercise.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-2">
                  <span className="font-medium">Set {setIndex + 1}</span>
                  <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-4">
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ""}
                      onChange={(e) =>
                        handleSetChange(
                          exerciseIndex,
                          setIndex,
                          "reps",
                          e.target.value
                        )
                      }
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Weight (lbs)"
                      value={set.weight || ""}
                      onChange={(e) =>
                        handleSetChange(
                          exerciseIndex,
                          setIndex,
                          "weight",
                          e.target.value
                        )
                      }
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Duration (min)"
                      value={set.duration || ""}
                      onChange={(e) =>
                        handleSetChange(
                          exerciseIndex,
                          setIndex,
                          "duration",
                          e.target.value
                        )
                      }
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Distance (miles)"
                      value={set.distance || ""}
                      onChange={(e) =>
                        handleSetChange(
                          exerciseIndex,
                          setIndex,
                          "distance",
                          e.target.value
                        )
                      }
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (!currentWorkout.exercises) return;
                      const newSets = [...exercise.sets];
                      newSets.splice(setIndex, 1);
                      updateExerciseInWorkout(exerciseIndex, { sets: newSets });
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!currentWorkout.exercises) return;
                  const newSets = [...exercise.sets, { reps: 0, weight: 0, duration: 0, distance: 0 }];
                  updateExerciseInWorkout(exerciseIndex, { sets: newSets });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Set
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddExercise}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>

        <div className="space-y-2">
          <label>Notes</label>
          <Textarea
            placeholder="How did the workout feel? Any achievements?"
            value={currentWorkout.notes || ""}
            onChange={(e) => updateCurrentWorkout({ notes: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label>Overall Feeling</label>
          <Select
            value={currentWorkout.overallFeeling || "good"}
            onValueChange={(value) =>
              updateCurrentWorkout({
                overallFeeling: value as "good" | "bad" | "okay",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select how you felt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="okay">Okay</SelectItem>
              <SelectItem value="bad">Bad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Workout"}
        </Button>
      </CardFooter>
    </Card>
  );
};
