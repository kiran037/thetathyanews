// File: components/main/library/library-stats.tsx
// Stats component for library pages

import { BookOpen, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface LibraryStatsProps {
  stats: {
    totalArticles?: number;
    completedArticles?: number;
    totalTimeSpent?: number;
    averageCompletion?: number;
  };
}

export function LibraryStats({ stats }: LibraryStatsProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} min`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const statItems = [
    {
      icon: BookOpen,
      label: "Total Articles",
      value: stats.totalArticles || 0,
      color: "text-blue-500",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: stats.completedArticles || 0,
      color: "text-green-500",
    },
    {
      icon: Clock,
      label: "Time Spent",
      value: stats.totalTimeSpent ? formatTime(stats.totalTimeSpent) : "0 min",
      color: "text-purple-500",
    },
    {
      icon: TrendingUp,
      label: "Avg Completion",
      value: stats.averageCompletion ? `${Math.round(stats.averageCompletion)}%` : "0%",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}