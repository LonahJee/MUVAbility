import React from "react";
import { ProgressStats as ProgressStatsType } from "utils/progressTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp, Activity, Calendar } from "lucide-react";

interface Props {
  stats: ProgressStatsType | null;
  isLoading: boolean;
}

export function ProgressStats({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-50">
            <CardContent className="pt-6 pb-6">
              <div className="h-20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No workout data available yet. Start logging your workouts to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Current Streak */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
            Current Streak
          </CardTitle>
          <CardDescription>Consecutive days active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-blue-600">{stats.currentStreak}</span>
            <span className="ml-1 text-gray-500 text-sm">day{stats.currentStreak !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* Longest Streak */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
            Longest Streak
          </CardTitle>
          <CardDescription>Best consistency record</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-green-600">{stats.longestStreak}</span>
            <span className="ml-1 text-gray-500 text-sm">day{stats.longestStreak !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Workouts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2 text-purple-500" />
            Total Workouts
          </CardTitle>
          <CardDescription>Overall sessions completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-purple-600">{stats.totalWorkouts}</span>
            <span className="ml-1 text-gray-500 text-sm">session{stats.totalWorkouts !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* Last Workout */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-orange-500" />
            Last Workout
          </CardTitle>
          <CardDescription>Most recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            {stats.lastWorkoutDate ? (
              <span className="font-semibold">
                {new Date(stats.lastWorkoutDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric'
                })}
              </span>
            ) : (
              <span className="text-gray-500">No workouts yet</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
