import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Subject,
  getReviews,
  getStudents,
  getSubjects,
  setSubjects,
  useAuth,
} from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { SubjectIcon } from "@/components/SubjectIcon";
import { TaskManager } from "@/components/TaskManager";
import { getSubjectPath } from "@/lib/subject-meta";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Settings } from "lucide-react";
import { toast } from "sonner";

export default function SubjectManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isLSM, setIsLSM] = useState(false);

  if (!user) return null;

  const subjects = getSubjects().filter((subject) => subject.facultyId === user.id);
  const allStudents = getStudents();
  const allReviews = getReviews();

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Enter subject name");
      return;
    }

    const store = getSubjects();
    if (editId) {
      const index = store.findIndex((subject) => subject.id === editId);
      if (index >= 0) {
        store[index].name = name.trim();
        store[index].isLSM = isLSM;
      }
    } else {
      store.push({
        id: `sub_${Date.now()}`,
        name: name.trim(),
        facultyId: user.id,
        isLSM,
      });
    }

    setSubjects(store);
    setDialogOpen(false);
    setName("");
    setIsLSM(false);
    setEditId(null);
    setTick((value) => value + 1);
    toast.success(editId ? "Subject updated" : "Subject added");
  };

  const handleDelete = (id: string) => {
    setSubjects(getSubjects().filter((subject) => subject.id !== id));
    setTick((value) => value + 1);
    toast.success("Subject deleted");
  };

  const handleEdit = (subject: Subject) => {
    setEditId(subject.id);
    setName(subject.name);
    setIsLSM(Boolean(subject.isLSM));
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditId(null);
    setName("");
    setIsLSM(false);
    setDialogOpen(true);
  };

  const heroSlides: HeroSlide[] = [
    {
      title: "Choose a subject workspace",
      subtitle: "Open a subject dashboard, review students, and manage your teaching flow.",
      ctaText: "Add New Subject",
      onCtaClick: openCreateDialog,
      icon: <Plus className="h-7 w-7" />,
    },
    {
      title: "Plan every subject deadline",
      subtitle: "Create faculty tasks, keep reminders visible, and stay ahead of due dates from one workspace.",
      ctaText: "Open Deadline Planner",
      onCtaClick: () =>
        document.getElementById("subject-task-manager")?.scrollIntoView({ behavior: "smooth" }),
      icon: <CalendarDays className="h-7 w-7" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mb-8">
        <HeroSlider slides={heroSlides} />
      </div>

      <div className="mx-auto max-w-[1400px] space-y-8 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Active Subjects</h2>
          <span className="font-medium text-slate-700 dark:text-slate-300">{subjects.length} Total</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject, index) => {
            const subjectReviews = allReviews.filter((review) => review.subjectId === subject.id);
            const completedReviews = subjectReviews.filter((review) => review.status === "completed").length;
            const progressPct = allStudents.length
              ? Math.round((completedReviews / allStudents.length) * 100)
              : 0;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(getSubjectPath(subject.name))}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]"
              >
                <div className="absolute right-4 top-4 z-20" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    >
                      <DropdownMenuItem onClick={() => handleEdit(subject)} className="cursor-pointer">
                        Edit Subject
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(subject.id)}
                        className="cursor-pointer text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
                      >
                        Delete Subject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-8">
                  <SubjectIcon subjectName={subject.name} />
                </div>

                <h3 className="mb-2 truncate text-2xl font-bold text-slate-900 dark:text-white">{subject.name}</h3>
                <p className="mb-6 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {subject.isLSM ? "LSM Cabin Review" : "Standard Presentation"}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span>{allStudents.length} Students</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{completedReviews} Reviews</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">Completion</span>
                      <span className="text-purple-600 dark:text-purple-400">{progressPct}% Reviewed</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateDialog}
            className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-6 transition-all duration-300 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-800/50 dark:bg-purple-900/10 dark:hover:bg-purple-900/20"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md dark:bg-[#0F172A]">
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Subject</h3>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">Create a new class for evaluation</p>
          </motion.button>
        </div>

        <div id="subject-task-manager">
          <TaskManager
            embedded
            title="Subject Deadline Planner"
            description="Create and update deadlines for any faculty subject right from the management page. Near-due tasks are highlighted automatically."
          />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {editId ? "Edit Subject Config" : "Create New Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Subject Name</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Data Analytics"
                className="h-12 rounded-xl border-slate-200 bg-white text-slate-900 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">LSM Cabin Review</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Mark this as a specialized cabin review subject.
                </p>
              </div>
              <Switch checked={isLSM} onCheckedChange={setIsLSM} />
            </div>

            <Button
              onClick={handleSave}
              className="h-12 w-full rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-700"
            >
              {editId ? "Update Subject" : "Launch Subject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
