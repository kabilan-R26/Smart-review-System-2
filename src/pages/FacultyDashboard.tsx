import { useState, useMemo } from "react";
import { useAuth, getSubjects, getReviews, setReviews, getStudents, ReviewRecord } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Upload, Filter, BookOpen, Plus, Download, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "review_submitted" | "not_submitted">("all");

  const [reviewModal, setReviewModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [marks, setMarks] = useState<number>(75);
  const [feedback, setFeedback] = useState("");

  const subjects = getSubjects().filter(s => s.facultyId === user?.id);
  const allReviews = getReviews();
  const allStudents = getStudents();

  const selectedSubjectObj = subjects.find(s => s.id === selectedSubject);

  const subjectReviews = useMemo(() => 
    allReviews.filter(r => r.subjectId === selectedSubject && r.facultyId === user?.id),
    [allReviews, selectedSubject, user?.id]
  );
  
  const pendingCount = useMemo(() => {
    return allReviews.filter(r => r.facultyId === user?.id && r.status !== "completed").length;
  }, [allReviews, user?.id]);

  const subjectStudents = allStudents;

  const completed = subjectReviews.filter(r => r.status === "completed").length;
  const inProgress = subjectReviews.filter(r => r.status === "review_submitted").length;
  const notReviewed = subjectStudents.length - completed - inProgress;

  const avgMarks = subjectReviews.filter(r => r.marks != null).length > 0
    ? Math.round(subjectReviews.filter(r => r.marks != null).reduce((sum, r) => sum + (r.marks || 0), 0) / subjectReviews.filter(r => r.marks != null).length)
    : 0;

  let filteredStudents = subjectStudents;
  if (search) {
    const q = search.toLowerCase();
    filteredStudents = filteredStudents.filter(s => 
      s.name.toLowerCase().includes(q) || (s.regNo && s.regNo.toLowerCase().includes(q))
    );
  }
  if (statusFilter !== "all" && selectedSubject) {
    filteredStudents = filteredStudents.filter(s => {
      const r = subjectReviews.find(rv => rv.studentId === s.id);
      const status = r?.status || "not_submitted";
      return status === statusFilter;
    });
  }

  const getStudentStatus = (studentId: string) => {
    const r = subjectReviews.find(rv => rv.studentId === studentId);
    return r?.status || "not_submitted";
  };

  const getStudentMarks = (studentId: string) => {
    const r = subjectReviews.find(rv => rv.studentId === studentId);
    return r?.marks;
  };

  const handleRowClick = (student: any) => {
    navigate(`/student/${student.id}`, { state: { student } });
  };

  const openReviewModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    const existing = subjectReviews.find(r => r.studentId === studentId);
    setMarks(existing?.marks || 75);
    setFeedback(existing?.feedback || "");
    setReviewModal(true);
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const handleSubmitReview = () => {
    if (!selectedStudentId || !selectedSubject || !user) return;
    const store = getReviews();
    const idx = store.findIndex(r => r.studentId === selectedStudentId && r.subjectId === selectedSubject && r.facultyId === user.id);

    const record: ReviewRecord = {
      id: idx >= 0 ? store[idx].id : `r_${Date.now()}`,
      studentId: selectedStudentId,
      subjectId: selectedSubject,
      facultyId: user.id,
      marks,
      feedback: feedback.trim() || "No feedback provided.",
      status: "completed",
      date: new Date().toISOString().split("T")[0],
      attendance: true,
    };

    if (idx >= 0) store[idx] = record;
    else store.push(record);

    setReviews(store);
    setReviewModal(false);
    toast.success(`Review submitted successfully! Grade: ${getGrade(marks)}`);
  };

  const pieData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Not Reviewed', value: notReviewed, color: '#ef4444' },
  ];

  const barData = subjects.map(s => {
    const revs = allReviews.filter(r => r.subjectId === s.id && r.facultyId === user?.id);
    const avg = revs.length > 0 ? Math.round(revs.reduce((sum, r) => sum + (r.marks || 0), 0) / revs.length) : 0;
    return { subject: s.name.slice(0,10), avgMarks: avg };
  });

  const heroSlides: HeroSlide[] = [
    {
      title: `Welcome back, ${user?.name?.split(" ")[0]} 👋`,
      subtitle: `You have ${pendingCount} pending reviews today`,
      ctaText: "Start Reviewing",
      onCtaClick: () => document.getElementById("select-subject-section")?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      title: "Your students need feedback 📊",
      subtitle: "Track performance and completion rates",
      ctaText: "View Analytics",
      onCtaClick: () => navigate("/analytics"),
    },
    {
      title: "Stay connected 💬",
      subtitle: "Chat with students instantly",
      ctaText: "Open Messages",
      onCtaClick: () => navigate("/messages"),
    }
  ];

  if (!user) return null;

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#020617] min-h-screen text-[#0F172A] dark:text-[#F8FAFC] pb-20">
      
      {/* Hero globally top */}
      <div className="mb-8">
        <HeroSlider slides={heroSlides} />
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0F172A] backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
           <div>
            <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Smart Academic Review System</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-[#0F172A] dark:text-white" onClick={() => navigate("/subjects")}>
               <Plus className="w-4 h-4 mr-2" /> Add Subject
             </Button>
             <Button variant="outline" className="border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-[#0F172A] dark:text-white" onClick={() => toast.success("Exporting Data...")}>
               <Download className="w-4 h-4 mr-2" /> Export CSV
             </Button>
             <Button className="bg-[#0F172A] hover:bg-gray-800 text-white dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-200" onClick={() => navigate("/analytics")}>
               <BarChart2 className="w-4 h-4 mr-2" /> View Analytics
             </Button>
          </div>
        </div>

        {/* Subject Selection */}
        {!selectedSubject && (
          <motion.div id="select-subject-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mt-4">
              Select a Subject to Begin Evaluation
            </h2>

            {subjects.length === 0 ? (
              <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-3xl py-20 text-center">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl mb-2">No Subjects Found</p>
                <p className="text-gray-500">Please add subjects first from Subject Management.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedSubject(subject.id)}
                    className="group cursor-pointer bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 flex flex-col items-center text-center shadow-sm"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6">
                      <BookOpen className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-500">Manage Students & Reviews</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedSubject && selectedSubjectObj && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{selectedSubjectObj.name} Dashboard</h2>
              <Button variant="ghost" className="text-purple-600" onClick={() => setSelectedSubject("")}>← Back to Subjects</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
               <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-2xl p-6 lg:col-span-1 shadow-sm">
                 <h3 className="text-lg font-semibold mb-4">Review Status</h3>
                 <div className="h-[250px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#4b5563' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-2xl p-6 lg:col-span-2 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Class Average Marks</h3>
                    <div className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md text-sm font-semibold">Overall: {avgMarks}%</div>
                 </div>
                 <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={barData.length ? barData : [{subject:"No Data", avgMarks: 0}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                       <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#4b5563' }} />
                       <Bar dataKey="avgMarks" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
                <Input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search students by name or reg no..." 
                  className="pl-11 h-12 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-[#0F172A] dark:text-white font-medium" 
                />
              </div>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-52 h-12 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-medium">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0F172A] border-gray-200 dark:border-white/10">
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="review_submitted">In Progress</SelectItem>
                  <SelectItem value="not_submitted">Not Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-white/5">
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">Student Name</TableHead>
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">Reg No.</TableHead>
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">Attendance</TableHead>
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">Status</TableHead>
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">Marks</TableHead>
                    <TableHead className="text-right font-semibold text-gray-800 dark:text-gray-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const status = getStudentStatus(student.id);
                    const marksVal = getStudentMarks(student.id);
                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200 dark:border-white/10">
                        <TableCell className="font-semibold">{student.name}</TableCell>
                        <TableCell className="font-mono text-gray-500">{student.regNo}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{student.attendance || 0}%</TableCell>
                        <TableCell><StatusBadge status={status as any} /></TableCell>
                        <TableCell className="font-bold text-lg">{marksVal !== undefined ? marksVal : "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openReviewModal(student.id)}>Review</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}