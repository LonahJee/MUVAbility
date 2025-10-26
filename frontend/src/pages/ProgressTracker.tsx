

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useUserGuardContext } from "app";
import { useProgressStore } from "utils/progressStore";
import { ImprovementChart } from "components/ImprovementChart";
import { WorkoutLogForm } from "components/WorkoutLogForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {useExerciseStore} from "utils/exerciseStore";


export default function ProgressTracker() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const {
    workoutLogs,
    isLoading,
    fetchWorkoutLogs,
    currentWorkout,
    startNewWorkout,
    setUserId,
  } = useProgressStore();

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const { exercises } = useExerciseStore();

  // Create a memoized list of unique exercises that have been logged
  const uniqueLoggedExercises = useMemo(() => {
    return [
      ...new Set(
        workoutLogs.flatMap(log => log.exercises.map(ex => ex.name))
      ),
    ];
  }, [workoutLogs]);

  // Create a list of all available exercises for the dropdown
  const availableExercisesForDropdown = useMemo(() => {
    return exercises.map(exercise => exercise.name);
  }, [exercises]);

  // Set a default exercise when the logged exercises are available
  useEffect(() => {
    if (!selectedExercise && uniqueLoggedExercises.length > 0) {
      setSelectedExercise(uniqueLoggedExercises[0]);
    }
  }, [uniqueLoggedExercises, selectedExercise]);

  const getChartData = (
    metric: 'weight' | 'reps' | 'duration' | 'distance',
    exerciseName: string | null
  ) => {
    if (!exerciseName) {
      return []; // Return empty data if no exercise is selected
    }

    return workoutLogs
      .map(log => {
        // Find all instances of the selected exercise within the log
        const relevantExercises = log.exercises.filter(ex => ex.exerciseName === exerciseName);
        
        if (relevantExercises.length === 0) {
          return null;
        }
        
        // Find the max value for the metric across all sets of that specific exercise
        const maxValue = Math.max(
          0,
          ...relevantExercises.flatMap(ex => 
            ex.sets.map(set => set[metric] || 0)
          )
        );

        return {
          date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          value: maxValue,
        };
      })
      .filter((dataPoint): dataPoint is { date: string, value: number } => dataPoint !== null && dataPoint.value > 0)
      .reverse();
  };

  const weightData = getChartData('weight', selectedExercise);
  const repsData = getChartData('reps', selectedExercise);
  const durationData = getChartData('duration', selectedExercise);
  const distanceData = getChartData('distance', selectedExercise);
    
  const [activeTab, setActiveTab] = useState("log");
  const historyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.uid) {
      console.log("Setting userId in store:", user.uid);
      setUserId(user.uid);
      fetchWorkoutLogs(user.uid);
      startNewWorkout();
    }
  }, [user, fetchWorkoutLogs, startNewWorkout, setUserId]);

  useEffect(() => {
    if (activeTab === "history" && workoutLogs.length > 0) {
      // Use a timeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        historyScrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [workoutLogs, activeTab]);

  return (
    <div className="relative container mx-auto px-4 py-8">
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Progress Tracker</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
        <p className="text-gray-500 mt-1">
          Track your exercise consistency and improvements over time
        </p>

        {/* Exercise Filter Dropdown */}
        <div className="mt-6 max-w-sm">
          <label htmlFor="exercise-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Show Progress For:
          </label>
          <Select
            value={selectedExercise || ''}
            onValueChange={(value) => setSelectedExercise(value)}
            disabled={availableExercisesForDropdown.length === 0}
          >
            <SelectTrigger id="exercise-filter">
              <SelectValue placeholder="Select an exercise to see progress" />
            </SelectTrigger>
            <SelectContent>
              {availableExercisesForDropdown.map((exerciseName) => (
                <SelectItem key={exerciseName} value={exerciseName}>
                  {exerciseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Improvements Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ImprovementChart title="Weight Progress (lbs)" data={weightData} strokeColor="#8884d8" metricName = "lbs"/>
          <ImprovementChart title="Reps Progress" data={repsData} strokeColor="#82ca9d" metricName = "reps"/>
          <ImprovementChart title="Duration Progress (minutes)" data={durationData} strokeColor="#ffc658" metricName = "minutes" />
          <ImprovementChart title="Distance Progress (m)" data={distanceData} strokeColor="#ff8042" metricName = "distance"/>
        </div>

        {/* Workout Logs & Form */}
        <Tabs defaultValue="log" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="log">Log Workout</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            {!currentWorkout && (
              <Button onClick={() => startNewWorkout()}>Start New Workout</Button>
            )}
          </div>
          <TabsContent value="log">
            {currentWorkout && <WorkoutLogForm />}
          </TabsContent>
          <TabsContent value="history">
            <div ref={historyScrollRef} className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
              {isLoading && <p>Loading history...</p>}
              {!isLoading && workoutLogs.length === 0 && (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No workout history yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start logging your workouts to build your history and track your progress.
                  </p>
                  <Button onClick={() => startNewWorkout()}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Log Your First Workout
                  </Button>
                </div>
              )}
              {!isLoading && workoutLogs.length > 0 && (
                <div className="space-y-4">
                  {workoutLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {new Date(log.date).toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                            {log.exercises.length} exercise{log.exercises.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {log.overallFeeling && (
                          <div className="text-sm">
                            <span className="font-medium">Feeling:</span> {log.overallFeeling}
                          </div>
                        )}
                      </div>
                      
                      {/* Exercise List */}
                      <div className="mt-3 space-y-2">
                        {log.exercises.map((exercise, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{exercise.exerciseName}</div>        
                            <div className="text-gray-500">
                              {exercise.sets.map((set, idx) => (
                                <span key={idx} className="mr-3">
                                  {set.reps && <span>{set.reps} reps</span>}
                                  {set.weight > 0 && <span> @ {set.weight} lbs</span>}
                                  {set.duration > 0 && <span className="ml-2">({set.duration} mins)</span>}
                                  {set.distance > 0 && <span className="ml-2">({set.distance} m)</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Notes */}
                      {log.notes && (
                        <div className="mt-3 text-sm" >
                          <span className="font-medium">Notes:</span> {log.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
