import { CalendarDays, Check } from "lucide-react";

const TASKS = [
  { id: 1, title: "Submit ML Assignment", date: "Today", completed: false },
  { id: 2, title: "Upload DSA File", date: "Tomorrow", completed: false },
  { id: 3, title: "Review Feedback", date: "Next Week", completed: true },
];

export function TaskPanelCard() {
  return (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-lg">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Pending Tasks</h3>
      <div className="space-y-3">
        {TASKS.map((task) => (
          <div key={task.id} className="group flex cursor-pointer flex-col rounded-xl bg-slate-50 p-3 transition duration-200 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${task.completed ? "border-purple-600 bg-purple-600 text-white" : "border-slate-300 group-hover:border-purple-500 dark:border-gray-500"}`}>
                {task.completed && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? "text-slate-500 line-through dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                  {task.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {task.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
