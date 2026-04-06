import { Check } from 'lucide-react';

const TASKS = [
  { id: 1, title: 'Submit ML Assignment', date: 'Today', completed: false },
  { id: 2, title: 'Upload DSA File', date: 'Tomorrow', completed: false },
  { id: 3, title: 'Review Feedback', date: 'Next Week', completed: true },
];

export function TaskPanel() {
  return (
    <div className="bg-white dark:bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-gray-200 dark:border-white/20 shadow-sm flex-1">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Pending Tasks</h3>
      <div className="space-y-3">
        {TASKS.map(task => (
          <div key={task.id} className="flex flex-col bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition duration-200 rounded-xl p-3 cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${task.completed ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 dark:border-gray-500 group-hover:border-purple-500'}`}>
                {task.completed && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <span>📅</span> {task.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
