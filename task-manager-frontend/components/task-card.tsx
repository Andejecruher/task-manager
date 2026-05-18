"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTask } from "@/hooks/use-task";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/schemas";
import type { User } from "@/types";
import type { Task } from "@/types/task";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";

const adjustDateForDisplay = (date: string | Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onClick?: () => void;
}

export function TaskCard({ task, assignee, onClick }: TaskCardProps) {
  const { moveToNextStatus } = useTask();
  const [isMoving, setIsMoving] = useState(false);

  const isOverdue =
    task.due_date &&
    adjustDateForDisplay(task.due_date) < adjustDateForDisplay(new Date()) &&
    task.status !== "done";

  const handleMoveToNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMoving) return;
    setIsMoving(true);
    try {
      await moveToNextStatus(task.id);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow space-y-3"
    >
      <div className="space-y-2">
        <h4 className="font-medium text-sm leading-tight text-pretty">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        {(task.tags ?? []).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.due_date && (
            <div
              className={`flex items-center gap-1 ${
                isOverdue ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              <Calendar className="h-3 w-3" />
              {format(adjustDateForDisplay(task.due_date), "MMM d")}
            </div>
          )}
        </div>
        {assignee && (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {assignee.fullName?.charAt(0).toUpperCase() ||
                assignee.email?.charAt(0).toUpperCase() ||
                "?"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
