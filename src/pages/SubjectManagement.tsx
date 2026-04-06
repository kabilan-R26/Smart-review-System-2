import { useState } from "react";
import { useAuth, getSubjects, setSubjects, getStudents, getReviews, Subject } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SubjectIcon } from "@/components/SubjectIcon";
import { useNavigate } from "react-router-dom";
import { getSubjectPath } from "@/lib/subject-meta";

export default function SubjectManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isLSM, setIsLSM] = useState(false);

  if (!user) return null;

  const subjects = getSubjects().filter(s => s.facultyId === user.id);
  const allStudents = getStudents();
  const allReviews = getReviews();

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Enter subject name");
      return;
    }

    const store = getSubjects();
    if (editId) {
      const idx = store.findIndex(s => s.id === editId);
      if (idx >= 0) {
        store[idx].name = name;
        store[idx].isLSM = isLSM;
      }
    } else {
      store.push({ 
        id: `sub_${Date.now()}`, 
        name, 
        facultyId: user.id, 
        isLSM 
      });
    }

    setSubjects(store);
    setDialogOpen(false);
    setName("");
    setIsLSM(false);
    setEditId(null);
    setTick(t => t + 1);
    toast.success(editId ? "Subject updated" : "Subject added");
  };

  const handleDelete = (id: string) => {
    setSubjects(getSubjects().filter(s => s.id !== id));
    setTick(t => t + 1);
    toast.success("Subject deleted");
  };

  const handleEdit = (s: Subject) => {
    setEditId(s.id);
    setName(s.name);
    setIsLSM(!!s.isLSM);
    setDialogOpen(true);
  };



  const heroSlides: HeroSlide[] = [
    {
      title: "Choose a Subject 🚀",
      subtitle: "Start evaluating students efficiently",
      ctaText: "Add New Subject",
      onCtaClick: () => {
         setEditId(null); 
         setName(""); 
         setIsLSM(false); 
         setDialogOpen(true); 
      }
    },
    {
      title: "Smart Review System",
      subtitle: "Track and manage all submissions",
      ctaText: "Manage Settings",
      onCtaClick: () => toast.success("Settings opened")
    }
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#020617] min-h-screen text-[#0F172A] dark:text-[#F8FAFC]">
      <div className="mb-8">
        <HeroSlider slides={heroSlides} />
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Active Subjects</h2>
          <span className="text-gray-500 dark:text-gray-400 font-medium">{subjects.length} Total</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((s, idx) => {
            const subjectReviews = allReviews.filter(r => r.subjectId === s.id);
            const completedReviews = subjectReviews.filter(r => r.status === "completed").length;
            const progressPct = allStudents.length ? Math.round((completedReviews / allStudents.length) * 100) : 0;

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(getSubjectPath(s.name))}
                className="group relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-gray-200 dark:border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
              >
                <div className="absolute top-4 right-4 z-20" onClick={e => e.stopPropagation()}>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                         <Settings className="h-4 w-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="bg-white dark:bg-[#0F172A] border-gray-200 dark:border-white/10 shadow-xl rounded-xl">
                       <DropdownMenuItem onClick={() => handleEdit(s)} className="cursor-pointer">Edit Subject</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10">Delete Subject</DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                </div>

                <div className="mb-8">
                  <SubjectIcon subjectName={s.name} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate">{s.name}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">{s.isLSM ? "LSM Cabin Review" : "Standard Presentation"}</p>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>{allStudents.length} Students</span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span>{completedReviews} Reviews</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500 dark:text-gray-400">Completion</span>
                      <span className="text-purple-600 dark:text-purple-400">{progressPct}% Reviewed</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditId(null); setName(""); setIsLSM(false); setDialogOpen(true); }}
            className="bg-purple-50/50 dark:bg-purple-900/10 border-2 border-dashed border-purple-200 dark:border-purple-800/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0F172A] shadow-md flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Subject</h3>
            <p className="text-sm font-medium text-gray-500 mt-2">Create a new class for evaluation</p>
          </motion.div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {editId ? "Edit Subject Config" : "Create New Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subject Name</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Data Analytics"
                className="rounded-xl h-12 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">LSM Cabin Review</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mark as specialized cabin review mode</p>
              </div>
              <Switch checked={isLSM} onCheckedChange={setIsLSM} />
            </div>

            <Button 
              onClick={handleSave} 
              className="w-full h-12 rounded-xl bg-[#0F172A] hover:bg-gray-800 text-white dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-200 font-bold"
            >
              {editId ? "Update Subject" : "Launch Subject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
