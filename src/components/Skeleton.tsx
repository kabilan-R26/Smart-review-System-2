import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700", className)} />;
}

export function LoadingSpinner({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent", className)}
    />
  );
}
