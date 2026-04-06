import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, Plus, Trash2 } from "lucide-react";
import {
  getSubjects,
  getTasks,
  setTasks,
  type TaskRecord,
  useAuth,
} from "@/contexts/AuthContext";
import { useDashboardState } from "@/contexts/DashboardStateContext";
import { getSubjectPath } from "@/lib/subject-meta";
import {
  formatTaskDeadline,
  getDaysUntilDeadline,
  isTaskNearDeadline,
  sortTasksByDeadline,
  type TaskStatus,
} from "@/lib/task-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TaskManagerProps {
  subjectId?: string;
  embedded?: boolean;
  title?: string;
  description?: string;
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  pending:
    "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-300",
  completed:
    "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-300",
  overdue:
    "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/12 dark:text-rose-300",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  overdue: "Overdue",
};

export function TaskManager({
  subjectId,
  embedded = false,
  title = "Deadline & Task Planner",
  description = "Create subject deadlines, keep an eye on approaching due dates, and mark work complete without leaving the faculty workspace.",
}: TaskManagerProps) {
  const { user } = useAuth();
  const { addNotification, refreshDashboardData } = useDashboardState();
  const [taskVersion, setTaskVersion] = useState(0);
  const [titleValue, setTitleValue] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId ?? "");
  const [deadline, setDeadline] = useState("");
  const facultyId = user?.role === "faculty" ? user.id : "";

  useEffect(() => {
    setSelectedSubjectId(subjectId ?? "");
  }, [subjectId]);

  void taskVersion;

  const subjects = facultyId ? getSubjects().filter((subject) => subject.facultyId === facultyId) : [];
  const nextTasks = facultyId ? getTasks().filter((task) => task.facultyId === facultyId) : [];
  const taskList = sortTasksByDeadline(
    subjectId ? nextTasks.filter((task) => task.subjectId === subjectId) : nextTasks,
  );

  if (!user || user.role !== "faculty") {
    return null;
  }

  const selectedSubject = subjects.find((subject) => subject.id === (subjectId ?? selectedSubjectId));

  const createTask = () => {
    const trimmedTitle = titleValue.trim();
    const resolvedSubjectId = subjectId ?? selectedSubjectId;

    if (!trimmedTitle) {
      toast.error("Enter a task title before saving.");
      return;
    }

    if (!resolvedSubjectId) {
      toast.error("Choose a subject for this deadline.");
      return;
    }

    if (!deadline) {
      toast.error("Pick a deadline to continue.");
      return;
    }

    const subject = subjects.find((item) => item.id === resolvedSubjectId);
    const nextTask: TaskRecord = {
      id: `task_${Date.now()}`,
      title: trimmedTitle,
      subjectId: resolvedSubjectId,
      facultyId: user.id,
      deadline,
      createdAt: new Date().toISOString(),
      completedAt: null,
      status: "pending",
    };

    setTasks([nextTask, ...getTasks()]);
    refreshDashboardData();
    setTaskVersion((current) => current + 1);
    setTitleValue("");
    if (!subjectId) {
      setSelectedSubjectId("");
    }
    setDeadline("");

    addNotification({
      title: `Deadline created for ${subject?.name ?? "selected subject"}`,
      description: `${trimmedTitle} is scheduled for ${formatTaskDeadline(deadline)}.`,
      href: subject ? getSubjectPath(subject.name) : "/tasks",
      kind: "activity",
    });
    toast.success("Task deadline created.");
  };

  const updateTask = (taskId: string, updater: (task: TaskRecord) => TaskRecord) => {
    const nextTasks = getTasks().map((task) => (task.id === taskId ? updater(task) : task));
    setTasks(nextTasks);
    refreshDashboardData();
    setTaskVersion((current) => current + 1);
  };

  const toggleCompleted = (task: TaskRecord) => {
    const nextCompletedAt = task.completedAt ? null : new Date().toISOString();
    updateTask(task.id, (current) => ({
      ...current,
      completedAt: nextCompletedAt,
    }));

    toast.success(task.completedAt ? "Task reopened." : "Task marked complete.");
  };

  const deleteTask = (task: TaskRecord) => {
    setTasks(getTasks().filter((item) => item.id !== task.id));
    refreshDashboardData();
    setTaskVersion((current) => current + 1);
    toast.success("Task removed.");
  };

  const taskStats = taskList.reduce(
    (accumulator, task) => {
      accumulator[task.status] += 1;
      return accumulator;
    },
    { pending: 0, completed: 0, overdue: 0 },
  );

  const containerClassName = embedded
    ? "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    : "mx-auto max-w-7xl space-y-6";

  return (
    <section className={containerClassName}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-700 dark:text-slate-300">
            {description}
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-md">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              Pending
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{taskStats.pending}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">
              Overdue
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{taskStats.overdue}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Completed
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{taskStats.completed}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Create a deadline</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add a task and the status updates automatically.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Task Title</Label>
              <Input
                value={titleValue}
                onChange={(event) => setTitleValue(event.target.value)}
                placeholder="e.g. ML Project Submission"
                className="field-surface h-12 rounded-2xl"
              />
            </div>

            {!subjectId && (
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Subject</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                  <SelectTrigger className="field-surface h-12 rounded-2xl">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {subjectId && selectedSubject && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Subject
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{selectedSubject.name}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Deadline</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="field-surface h-12 rounded-2xl"
              />
            </div>

            <Button
              type="button"
              onClick={createTask}
              className="h-12 w-full rounded-xl bg-purple-600 font-semibold text-white hover:bg-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {taskList.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <Clock3 className="h-10 w-10 text-slate-500 dark:text-slate-400" />
              <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No deadlines created yet</p>
              <p className="mt-2 max-w-md text-sm text-slate-700 dark:text-slate-300">
                Add your first task to start tracking what is pending, overdue, or already completed.
              </p>
            </div>
          ) : (
            taskList.map((task, index) => {
              const subject = subjects.find((item) => item.id === task.subjectId);
              const daysLeft = getDaysUntilDeadline(task.deadline);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[task.status]}`}>
                          {STATUS_LABELS[task.status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-700 dark:bg-slate-800">
                          {subject?.name ?? "Subject removed"}
                        </span>
                        <span>Deadline: {formatTaskDeadline(task.deadline)}</span>
                        <span>
                          {task.status === "completed"
                            ? `Completed on ${formatTaskDeadline(task.completedAt ?? task.deadline)}`
                            : daysLeft >= 0
                              ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                              : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`}
                        </span>
                      </div>

                      {isTaskNearDeadline(task) && (
                        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-300">
                          <AlertTriangle className="h-4 w-4" />
                          Deadline approaching!
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={task.status === "completed" ? "outline" : "default"}
                        onClick={() => toggleCompleted(task)}
                        className={
                          task.status === "completed"
                            ? "rounded-xl border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                            : "rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {task.status === "completed" ? "Reopen" : "Mark Complete"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => deleteTask(task)}
                        className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default TaskManager;
