import { useEffect, useMemo, useState } from "react";
import {
  ReviewRecord,
  getFiles,
  getReviews,
  getStudents,
  getSubjects,
  setReviews,
  useAuth,
} from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { AIFeedback } from "@/components/AIFeedback";
import { ExportPDF } from "@/components/ExportPDF";
import { Skeleton } from "@/components/Skeleton";
import { TaskManager } from "@/components/TaskManager";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  BarChart2,
  CalendarDays,
  Filter,
  LineChart,
  MessageCircleMore,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { SubjectIcon } from "@/components/SubjectIcon";
import { UserAvatar } from "@/components/UserAvatar";
import { useDashboardState } from "@/contexts/DashboardStateContext";
import { findSubjectBySlug, getSubjectPath } from "@/lib/subject-meta";

type ReviewFilter = "all" | "completed" | "review_submitted" | "not_submitted";

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const { addNotification, refreshDashboardData, routeLoading } = useDashboardState();
  const navigate = useNavigate();
  const { subjectSlug } = useParams<{ subjectSlug?: string }>();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewFilter>("all");
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [marks, setMarks] = useState<number>(75);
  const [feedback, setFeedback] = useState("");

  const subjects = useMemo(
    () => getSubjects().filter((subject) => subject.facultyId === user?.id),
    [user?.id],
  );
  const allReviews = getReviews();
  const allStudents = getStudents();

  const selectedSubject = useMemo(
    () => findSubjectBySlug(subjects, subjectSlug),
    [subjectSlug, subjects],
  );

  useEffect(() => {
    setSearch("");
    setStatusFilter("all");
    setReviewModal(false);
    setSelectedStudentId(null);
  }, [subjectSlug]);

  const subjectReviews = useMemo(
    () =>
      selectedSubject
        ? allReviews.filter(
            (review) => review.subjectId === selectedSubject.id && review.facultyId === user?.id,
          )
        : [],
    [allReviews, selectedSubject, user?.id],
  );

  const pendingCount = useMemo(
    () => allReviews.filter((review) => review.facultyId === user?.id && review.status !== "completed").length,
    [allReviews, user?.id],
  );

  const filteredStudents = useMemo(() => {
    if (!selectedSubject) return allStudents;

    let nextStudents = allStudents;
    if (search) {
      const query = search.toLowerCase();
      nextStudents = nextStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.regNo?.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      nextStudents = nextStudents.filter((student) => {
        const review = subjectReviews.find((item) => item.studentId === student.id);
        return (review?.status ?? "not_submitted") === statusFilter;
      });
    }

    return nextStudents;
  }, [allStudents, search, selectedSubject, statusFilter, subjectReviews]);

  const completed = subjectReviews.filter((review) => review.status === "completed").length;
  const inProgress = subjectReviews.filter((review) => review.status === "review_submitted").length;
  const notReviewed = Math.max(allStudents.length - completed - inProgress, 0);

  const avgMarks = subjectReviews.filter((review) => review.marks != null).length
    ? Math.round(
        subjectReviews
          .filter((review) => review.marks != null)
          .reduce((total, review) => total + (review.marks ?? 0), 0) /
          subjectReviews.filter((review) => review.marks != null).length,
      )
    : 0;

  const pieData = [
    { name: "Completed", value: completed, color: "#10b981" },
    { name: "In Progress", value: inProgress, color: "#f59e0b" },
    { name: "Not Reviewed", value: notReviewed, color: "#ef4444" },
  ];

  const barData = subjects.map((subject) => {
    const subjectResult = allReviews.filter(
      (review) => review.subjectId === subject.id && review.facultyId === user?.id,
    );
    const subjectAverage = subjectResult.length
      ? Math.round(
          subjectResult.reduce((total, review) => total + (review.marks ?? 0), 0) / subjectResult.length,
        )
      : 0;

    return {
      subject: subject.name.length > 14 ? `${subject.name.slice(0, 14)}...` : subject.name,
      avgMarks: subjectAverage,
    };
  });

  const heroSlides: HeroSlide[] = [
    {
      title: `Welcome back, ${user?.name?.split(" ")[0] ?? "Faculty"}`,
      subtitle: `You have ${pendingCount} pending reviews ready for action.`,
      ctaText: selectedSubject ? "Review This Subject" : "Choose a Subject",
      onCtaClick: () =>
        document
          .getElementById(selectedSubject ? "subject-students-section" : "select-subject-section")
          ?.scrollIntoView({ behavior: "smooth" }),
      icon: <Sparkles className="h-7 w-7" />,
    },
    {
      title: "Track performance with clarity",
      subtitle: "Monitor averages, completion trends, and follow-up needs in one place.",
      ctaText: "View Analytics",
      onCtaClick: () => navigate("/analytics"),
      icon: <LineChart className="h-7 w-7" />,
    },
    {
      title: "Keep conversations moving",
      subtitle: "Open messages and respond to students without leaving the dashboard flow.",
      ctaText: "Open Messages",
      onCtaClick: () => navigate("/messages"),
      icon: <MessageCircleMore className="h-7 w-7" />,
    },
  ];

  if (!user) return null;

  const getStudentStatus = (studentId: string) =>
    subjectReviews.find((review) => review.studentId === studentId)?.status ?? "not_submitted";

  const getStudentMarks = (studentId: string) =>
    subjectReviews.find((review) => review.studentId === studentId)?.marks;

  const handleStudentOpen = (studentId: string) => {
    const student = allStudents.find((item) => item.id === studentId);
    if (!student) return;
    navigate(`/student/${student.id}`, { state: { student } });
  };

  const openReviewModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    const existing = subjectReviews.find((review) => review.studentId === studentId);
    setMarks(existing?.marks ?? 75);
    setFeedback(existing?.feedback ?? "");
    setReviewModal(true);
  };

  const getGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const handleSubmitReview = () => {
    if (!selectedStudentId || !selectedSubject) return;

    const store = getReviews();
    const reviewIndex = store.findIndex(
      (review) =>
        review.studentId === selectedStudentId &&
        review.subjectId === selectedSubject.id &&
        review.facultyId === user.id,
    );

    const record: ReviewRecord = {
      id: reviewIndex >= 0 ? store[reviewIndex].id : `r_${Date.now()}`,
      studentId: selectedStudentId,
      subjectId: selectedSubject.id,
      facultyId: user.id,
      marks,
      feedback: feedback.trim() || "No feedback provided.",
      status: "completed",
      date: new Date().toISOString().split("T")[0],
      attendance: true,
    };

    if (reviewIndex >= 0) {
      store[reviewIndex] = record;
    } else {
      store.push(record);
    }

    setReviews(store);
    refreshDashboardData();
    addNotification({
      title: `Review saved for ${selectedStudent?.name ?? "student"}`,
      description: `${selectedSubject.name} was updated with ${marks}/100 and fresh faculty feedback.`,
      href: "/reviews",
      kind: "review",
    });
    setReviewModal(false);
    toast.success(`Review submitted successfully. Grade: ${getGrade(marks)}`);
  };

  const selectedStudent = allStudents.find((student) => student.id === selectedStudentId);
  const selectedStudentFiles =
    selectedStudentId && selectedSubject
      ? getFiles().filter((file) => file.studentId === selectedStudentId && file.subjectId === selectedSubject.id)
      : [];
  const aiSubmissionContext = [
    selectedStudent ? `Student ${selectedStudent.name}` : "",
    selectedSubject ? `Subject ${selectedSubject.name}` : "",
    `Draft marks ${marks}`,
    selectedStudentFiles.length > 0
      ? `Uploaded files: ${selectedStudentFiles.map((file) => file.fileName).join(", ")}`
      : "No uploaded files were found for this subject yet.",
    feedback ? `Existing feedback: ${feedback}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mb-8">
        <HeroSlider slides={heroSlides} />
      </div>

      <div className="mx-auto max-w-[1400px] space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
            <p className="mt-1 text-slate-700 dark:text-slate-300">
              Smart Academic Review System for subject-by-subject evaluation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="cursor-pointer border-slate-200 text-slate-900 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
              onClick={() => navigate("/subjects")}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Subject
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer border-slate-200 text-slate-900 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
              onClick={() => navigate("/tasks")}
            >
              <CalendarDays className="mr-2 h-4 w-4" /> Open Tasks
            </Button>
            <Button
              className="cursor-pointer bg-purple-600 text-white hover:bg-purple-700 active:scale-95 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
              onClick={() => navigate("/analytics")}
            >
              <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer border-slate-200 text-slate-900 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
              onClick={() => navigate("/leaderboard")}
            >
              <Trophy className="mr-2 h-4 w-4" /> Leaderboard
            </Button>
          </div>
        </div>

        {routeLoading ? (
          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: Math.max(subjects.length, 3) }).map((_, index) => (
                <div key={`subject-skeleton-${index}`} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Skeleton className="mb-6 h-[72px] w-[72px] rounded-[22px]" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-6 h-[220px] w-full rounded-3xl" />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-6 h-[260px] w-full rounded-3xl" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={`table-skeleton-${index}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : !subjectSlug && (
          <motion.section
            id="select-subject-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Select a subject to begin evaluation</h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                Each subject opens in its own route so you can bookmark and revisit it directly.
              </p>
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
                <Upload className="mx-auto mb-4 h-16 w-16 text-slate-500 dark:text-slate-400" />
                <p className="mb-2 text-xl">No subjects found</p>
                <p className="text-slate-700 dark:text-slate-300">Add your first subject from Subject Management to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject, index) => (
                  <motion.button
                    key={subject.id}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(getSubjectPath(subject.name))}
                    className="group flex cursor-pointer flex-col rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:border-violet-300 hover:shadow-[0_20px_60px_rgba(79,70,229,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-400/40 dark:hover:shadow-[0_20px_60px_rgba(129,140,248,0.16)]"
                  >
                    <SubjectIcon subjectName={subject.name} className="mb-6" />
                    <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-300">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {subject.isLSM
                        ? "Launch cabin reviews and mentoring notes."
                        : "Manage students, marks, and review progress."}
                    </p>
                    <span className="mt-6 inline-flex text-sm font-semibold text-violet-600 transition-transform group-hover:translate-x-1 dark:text-violet-300">
                      Open subject dashboard
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {!routeLoading && subjectSlug && !selectedSubject && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-2xl font-semibold">Subject not found</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              This subject link no longer matches an active faculty subject.
            </p>
            <Button className="mt-6 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
            </Button>
          </motion.section>
        )}

        {!routeLoading && selectedSubject && (
          <section className="space-y-8">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <SubjectIcon subjectName={selectedSubject.name} />
                <div>
                  <h2 className="text-2xl font-semibold">{selectedSubject.name}</h2>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedSubject.isLSM ? "Cabin review workflow" : "Presentation review workflow"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-fit cursor-pointer text-violet-600 hover:bg-violet-50 hover:text-violet-700 active:scale-95 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 text-lg font-semibold">Review status</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={82} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        itemStyle={{ color: "#4b5563" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold">Class average marks</h3>
                  <div className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    Overall average: {avgMarks}%
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData.length ? barData : [{ subject: "No Data", avgMarks: 0 }]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.3} />
                      <XAxis
                        dataKey="subject"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        itemStyle={{ color: "#4b5563" }}
                      />
                      <Bar dataKey="avgMarks" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div id="subject-students-section" className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search students by name or registration number..."
                    className="h-12 rounded-2xl border-slate-200 bg-white pl-11 font-medium text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: ReviewFilter) => setStatusFilter(value)}>
                  <SelectTrigger className="h-12 w-56 rounded-2xl border-slate-200 bg-white font-medium text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="review_submitted">In Progress</SelectItem>
                    <SelectItem value="not_submitted">Not Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/70">
                      <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Student</TableHead>
                      <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Reg No.</TableHead>
                      <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Attendance</TableHead>
                      <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Status</TableHead>
                      <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Marks</TableHead>
                      <TableHead className="text-right font-semibold text-slate-800 dark:text-slate-200">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const studentStatus = getStudentStatus(student.id);
                      const studentMarks = getStudentMarks(student.id);

                      return (
                        <TableRow
                          key={student.id}
                          onClick={() => handleStudentOpen(student.id)}
                          className="cursor-pointer border-slate-200 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/70 dark:active:bg-slate-800"
                        >
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={student} className="h-11 w-11" fallbackClassName="text-xs" />
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                                <p className="text-xs text-slate-700 dark:text-slate-300">{student.department}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-slate-700 dark:text-slate-300">{student.regNo}</TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">{student.attendance ?? 0}%</TableCell>
                          <TableCell>
                            <StatusBadge status={studentStatus} />
                          </TableCell>
                          <TableCell className="text-lg font-bold">{studentMarks ?? "--"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer active:scale-95"
                              onClick={(event) => {
                                event.stopPropagation();
                                openReviewModal(student.id);
                              }}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredStudents.length === 0 && (
                  <div className="px-6 py-12 text-center text-sm text-slate-700 dark:text-slate-300">
                    No students match the current filters for this subject.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!routeLoading && (
          <TaskManager
            embedded
            subjectId={selectedSubject?.id}
            title={selectedSubject ? `${selectedSubject.name} Deadlines` : "Faculty Deadlines"}
            description={
              selectedSubject
                ? "Create and manage deadlines just for this subject, with reminders when a due date is within two days."
                : "Track deadlines across all active faculty subjects and keep upcoming submissions visible from the dashboard."
            }
          />
        )}
      </div>

      <Dialog open={reviewModal} onOpenChange={setReviewModal}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Submit Review
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <UserAvatar user={selectedStudent} className="h-12 w-12" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedStudent.name}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedStudent.regNo}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Marks (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={marks}
                  onChange={(event) => setMarks(Number(event.target.value))}
                  className="h-12 rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Write a clear, actionable review for the student."
                  rows={4}
                  className="rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <AIFeedback
                contextKey={`${selectedStudentId ?? "none"}-${selectedSubject?.id ?? "none"}-${marks}`}
                submissionText={aiSubmissionContext}
                studentName={selectedStudent.name}
                subjectName={selectedSubject?.name ?? "Selected Subject"}
                marks={marks}
                onApplyFeedback={setFeedback}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <ExportPDF
                  student={selectedStudent}
                  facultyName={user.name}
                  reviews={allReviews
                    .filter((review) => review.studentId === selectedStudent.id && review.facultyId === user.id)
                    .map((review) => ({
                      subjectName:
                        getSubjects().find((subject) => subject.id === review.subjectId)?.name ?? "Subject",
                      marks: review.marks,
                      feedback: review.feedback,
                      status: review.status,
                      date: review.date,
                    }))}
                  files={getFiles().filter(
                    (file) =>
                      file.studentId === selectedStudent.id &&
                      subjects.some((subject) => subject.id === file.subjectId),
                  )}
                  label="Download PDF"
                  variant="outline"
                  className="h-12 flex-1 cursor-pointer rounded-2xl border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                />
                <Button
                  onClick={handleSubmitReview}
                  className="h-12 flex-1 cursor-pointer rounded-2xl bg-purple-600 font-semibold text-white hover:bg-purple-700 active:scale-[0.99]"
                >
                  Save Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
