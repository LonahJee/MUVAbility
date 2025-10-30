import { useCurrentUser } from "app";

import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useExerciseStore } from "utils/exerciseStore";
import { Dumbbell } from 'lucide-react';
import { Heart } from 'lucide-react';
import useFavoritesStore  from 'utils/favoritesStore';
import { seedExercises } from 'utils/exerciseFirestore';
import { Exercise } from 'utils/types';
import ExerciseCard from 'components/ExerciseCard';

const ExerciseLibrary = () => {
  const { user } = useCurrentUser(); // Correctly call hook at the top level
  const { favoriteIds, toggleFavorite, loadFavorites } = useFavoritesStore();
  
  const navigate = useNavigate();
  // 1. Connect to exercise store to get data and functions
  const {
    exercises,
    filter,
    setFilter,
    fetchExercises,
    isLoading,
    error,
    clearFilters,
  } = useExerciseStore();
  // sorting logic if it's a favorite it goes to the front of the list if it's not it stays in it's place. 
  const sortedExercises =
  exercises && exercises.length
    ? [...exercises].sort((a, b) => {
  const isAFavorite = favoriteIds.includes(a.id);
  const isBFavorite = favoriteIds.includes(b.id);

  if (isAFavorite && !isBFavorite) {
    // 'a' is a favorite and 'b' isn't, so 'a' comes first.
    return -1;
  }

  if (!isAFavorite && isBFavorite) {
    // 'b' is a favorite and 'a' isn't, so 'b' comes first.
    return 1;
  }

  // Both are favorites or both are not, so their order doesn't matter.
  return 0;
}): [];

  
  useEffect(() => {
    const initializeExercises = async () => {
      
      await fetchExercises();
      
      
      const { exercises } = useExerciseStore.getState();
      
      
      if (exercises.length === 0) {
        console.log("No exercises found, seeding database...");
        await seedExercises();
        // After seeding, fetch the new data
        await fetchExercises();
      }
    };

    initializeExercises();
  }, [fetchExercises]);

  // 3. Define the options for your dropdown filters
  const targetAreaOptions = ["upper_body", "core", "lower_body", "cardiovascular", "flexibility", "balance", "strength", "dexterity"];
  const difficultyOptions = ["easy", "medium", "hard"];
  const typeOptions = ["Cardio", "Strength", "Stretching"]; // Adjusted to match potential values in your data

  const handleFilterChange = (filterKey, value) => {
    const newFilter = { ...filter, [filterKey]: value === 'all' ? undefined : value };
    
    Object.keys(newFilter).forEach(key => newFilter[key] === undefined && delete newFilter[key]);
    fetchExercises(newFilter);
    setFilter(newFilter);
  };

  // Load favorites when the user is available
  useEffect(() => {
    if (user) {
      loadFavorites(user.uid);
    }
  }, [user, loadFavorites, fetchExercises]);

  return (
    
      
    <div className="p-6 bg-gray-50 min-h-screen">
      

      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>
        
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Exercise Library</h1>
        <p className="text-lg text-gray-600">Find the perfect exercises to help you reach your goals.</p>
      </header>

      {/* Filter Controls */}
      <div className="p-4 bg-white rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <h3 className="text-lg font-semibold text-gray-700 md:col-span-1">Filter by:</h3>
          
          {/* Target Area Filter */}
          <Select onValueChange={(value) => handleFilterChange('targetArea', value)} value={filter.targetArea || 'all'}>
            <SelectTrigger><SelectValue placeholder="Target Area" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Target Areas</SelectItem>
              {targetAreaOptions.map(o => <SelectItem key={o} value={o}>{o.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select onValueChange={(value) => handleFilterChange('difficulty', value)} value={String(filter.difficulty || 'all')}>
            <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {difficultyOptions.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
          
          {/* Type Filter */}
          <Select onValueChange={(value) => handleFilterChange('type', value)} value={filter.type || 'all'}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {typeOptions.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>

        </div>
          <div className="flex justify-end mt-4">
             <Button onClick={clearFilters} variant="ghost">Clear Filters</Button>
          </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && <p>Loading exercises...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Exercise Grid */}
      {!isLoading && !error && exercises.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No exercises match the current filters.</p>
      )}
      {!isLoading && !error && exercises.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedExercises.map((exercise) => (
            <ExerciseCard 
              key={exercise.id}
              exercise={exercise}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
