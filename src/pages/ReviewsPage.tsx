import { useState } from "react";
import { useAuth, getStudents, getSubjects, getReviews, setReviews, ReviewRecord } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, Clock, AlertCircle, ClipboardCheck, Presentation } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [, setTick] = useState(0);

  if (!user) return null;

  const subjects = getSubjects().filter(s => s.facultyId === user.id);
  const reviews = getReviews();
  const allStudents = getStudents();
  const selectedSubjectObj = subjects.find(s => s.id === selectedSubject);

  const getStatus = (studentId: string) => {
    const r = reviews.find(rv => rv.studentId === studentId && rv.subjectId === selectedSubject && rv.facultyId === user.id);
    return r?.status || "not_submitted" as const;
  };

  const getMarks = (studentId: string) => {
    const r = reviews.find(rv => rv.studentId === studentId && rv.subjectId === selectedSubject && rv.facultyId === user.id);
    return r?.marks;
  };

  let filtered = allStudents;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.regNo?.toLowerCase().includes(q));
  }

  const completed = selectedSubject ? filtered.filter(s => getStatus(s.id) === "completed").length : 0;
  const pending = selectedSubject ? filtered.filter(s => getStatus(s.id) === "review_submitted").length : 0;

  const handleOpenReview = (studentId: string) => {
    setSelectedStudent(studentId);
    const existing = reviews.find(r => r.studentId === studentId && r.subjectId === selectedSubject && r.facultyId === user.id);
    setMarks(existing?.marks?.toString() || "");
    setFeedback(existing?.feedback || "");
    setDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedStudent || !selectedSubject || !marks) { toast.error("Enter marks"); return; }
    const store = getReviews();
    const idx = store.findIndex(r => r.studentId === selectedStudent && r.subjectId === selectedSubject && r.facultyId === user.id);
    const record: ReviewRecord = {
      id: idx >= 0 ? store[idx].id : `r_${Date.now()}`,
      studentId: selectedStudent,
      subjectId: selectedSubject,
      facultyId: user.id,
      marks: parseInt(marks),
      feedback,
      status: "completed",
      date: new Date().toISOString().split("T")[0],
      attendance: true,
    };
    if (idx >= 0) store[idx] = record; else store.push(record);
    setReviews(store);
    setDialogOpen(false);
    setTick(t => t + 1);
    toast.success("Review saved");
  };

  const studentObj = allStudents.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-gray-400 text-sm mt-1">
          {selectedSubjectObj?.isLSM ? "🏠 LSM Cabin Review" : "📊 Presentation Review"} — Evaluate students subject-wise
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-72 rounded-xl h-11 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1b3a] border-white/10">
            {subjects.map(s => <SelectItem key={s.id} value={s.id} className="text-gray-200 focus:bg-purple-500/20 focus:text-white">{s.name}{s.isLSM ? " 🏠" : " 📊"}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="pl-10 rounded-xl h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
        </div>
      </div>

      {selectedSubject && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Completed" value={completed} icon={CheckCircle} variant="success" delay={0} />
            <StatCard title="In Progress" value={pending} icon={Clock} variant="warning" delay={1} />
            <StatCard title="Not Reviewed" value={filtered.length - completed - pending} icon={AlertCircle} variant="danger" delay={2} />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card-elevated overflow-hidden rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-white/10">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Reg No</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Marks</TableHead>
                    <TableHead className="text-gray-400 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(student => {
                    const status = getStatus(student.id);
                    const studentMarks = getMarks(student.id);
                    return (
                      <TableRow key={student.id} className="zebra-row hover:bg-white/5 transition-all border-white/5">
                        <TableCell className="font-medium text-white">{student.name}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-400">{student.regNo}</TableCell>
                        <TableCell><StatusBadge status={status} /></TableCell>
                        <TableCell className="font-semibold text-purple-300">{studentMarks != null ? `${studentMarks}/100` : "—"}</TableCell>
                        <TableCell className="text-right">
                          <button
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1 ml-auto ${
                              status === "completed"
                                ? "bg-white/10 text-gray-300 hover:bg-white/20"
                                : "gradient-btn text-white hover:scale-105 shadow-lg"
                            }`}
                            onClick={() => handleOpenReview(student.id)}>
                            <ClipboardCheck className="h-3.5 w-3.5" /> {status === "completed" ? "Edit" : "Review"}
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </>
      )}

      {!selectedSubject && (
        <div className="glass-card-elevated rounded-2xl py-16 text-center">
          <Presentation className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Select a subject to start reviewing students</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1b3a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedSubjectObj?.isLSM ? "🏠 Cabin Review" : "📊 Presentation Review"}</DialogTitle>
          </DialogHeader>
          {studentObj && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3 border border-white/10">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {studentObj.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{studentObj.name}</p>
                  <p className="text-xs text-gray-500">{studentObj.regNo}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Marks (0-100)</Label>
                <Input type="number" min={0} max={100} value={marks} onChange={e => setMarks(e.target.value)}
                  className="rounded-xl h-11 bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Feedback</Label>
                <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write feedback..." rows={3}
                  className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
              </div>
              <button onClick={handleSubmitReview} className="w-full rounded-xl h-11 gradient-btn text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg">
                Save Review
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
