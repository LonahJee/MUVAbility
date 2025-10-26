import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakTrackerProps {
  streak: number;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ streak }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
        <Flame className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{streak} days</div>
        <p className="text-xs text-muted-foreground">
          Keep it up to build your habit!
        </p>
      </CardContent>
    </Card>
  );
};
