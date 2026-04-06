import { differenceInCalendarDays, format, isValid, parseISO, startOfDay } from "date-fns";

export type TaskStatus = "pending" | "completed" | "overdue";

export interface TaskLike {
  deadline: string;
  completedAt?: string | null;
}

function parseTaskDate(value: string) {
  const parsed = parseISO(value);
  if (isValid(parsed)) {
    return startOfDay(parsed);
  }

  const fallback = new Date(value);
  return startOfDay(Number.isNaN(fallback.getTime()) ? new Date() : fallback);
}

export function getTaskStatus(task: TaskLike): TaskStatus {
  if (task.completedAt) {
    return "completed";
  }

  const today = startOfDay(new Date());
  const deadline = parseTaskDate(task.deadline);

  return deadline < today ? "overdue" : "pending";
}

export function getDaysUntilDeadline(deadline: string) {
  return differenceInCalendarDays(parseTaskDate(deadline), startOfDay(new Date()));
}

export function isTaskNearDeadline(task: TaskLike) {
  const daysLeft = getDaysUntilDeadline(task.deadline);
  return getTaskStatus(task) === "pending" && daysLeft >= 0 && daysLeft <= 2;
}

export function formatTaskDeadline(deadline: string) {
  return format(parseTaskDate(deadline), "dd MMM yyyy");
}

export function sortTasksByDeadline<T extends TaskLike>(tasks: T[]) {
  return [...tasks].sort(
    (left, right) => parseTaskDate(left.deadline).getTime() - parseTaskDate(right.deadline).getTime(),
  );
}
