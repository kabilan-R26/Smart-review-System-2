import { CompletionStatus } from "@/contexts/AuthContext";

const CONFIG: Record<CompletionStatus, { label: string; className: string; dotClass: string }> = {
  completed: { label: "Completed", className: "bg-status-success/15 text-status-success border border-status-success/20", dotClass: "bg-status-success" },
  review_submitted: { label: "In Progress", className: "bg-status-warning/15 text-status-warning border border-status-warning/20", dotClass: "bg-status-warning" },
  not_submitted: { label: "Not Reviewed", className: "bg-status-danger/15 text-status-danger border border-status-danger/20", dotClass: "bg-status-danger" },
};

export function StatusBadge({ status }: { status: CompletionStatus }) {
  const { label, className, dotClass } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`} />
      {label}
    </span>
  );
}
