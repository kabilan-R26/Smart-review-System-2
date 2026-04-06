import { cn } from "@/lib/utils";

interface AppBrandProps {
  role?: string;
  compact?: boolean;
  className?: string;
}

export function AppBrand({ role, compact = false, className }: AppBrandProps) {
  return (
    <div className={cn("flex items-center gap-3 overflow-hidden", className)}>
      <img
        src="/smart-faculty-logo.svg"
        alt="Smart Academic Review System"
        className="h-10 w-10 shrink-0 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700"
      />
      {!compact && (
        <div className="min-w-0">
          <p className="max-w-[180px] text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            Smart Academic Review System
          </p>
          {role && (
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
              {role}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
