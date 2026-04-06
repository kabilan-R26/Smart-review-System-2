import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import {
  type ReviewRecord,
  getFiles,
  getReviews,
  getStudents,
  getSubjects,
  setReviews,
  useAuth,
} from "@/contexts/AuthContext";
import { AIFeedback } from "@/components/AIFeedback";
import { ExportPDF } from "@/components/ExportPDF";
import { Skeleton } from "@/components/Skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDashboardState } from "@/contexts/DashboardStateContext";
import { toast } from "sonner";

export default function ReviewsDashboardPage() {
  const { user } = useAuth();
  const { addNotification, refreshDashboardData, routeLoading } = useDashboardState();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [, setReviewVersion] = useState(0);

  const subjects = useMemo(() => getSubjects().filter((subject) => subject.facultyId === user?.id), [user?.id]);
  const reviews = getReviews();
  const students = useMemo(() => getStudents(), []);

  if (!user) return null;

  const selectedSubjectRecord = subjects.find((subject) => subject.id === selectedSubject);
  const filteredStudents = students.filter((student) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return student.name.toLowerCase().includes(query) || student.regNo?.toLowerCase().includes(query);
  });

  const getReview = (studentId: string) =>
    reviews.find(
      (review) => review.studentId === studentId && review.subjectId === selectedSubject && review.facultyId === user.id,
    );

  const completedCount = selectedSubject
    ? filteredStudents.filter((student) => getReview(student.id)?.status === "completed").length
    : 0;
  const inProgressCount = selectedSubject
    ? filteredStudents.filter((student) => getReview(student.id)?.status === "review_submitted").length
    : 0;
  const notReviewedCount = selectedSubject ? filteredStudents.length - completedCount - inProgressCount : 0;
  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  const openReviewDialog = (studentId: string) => {
    const existingReview = getReview(studentId);
    setSelectedStudentId(studentId);
    setMarks(existingReview?.marks?.toString() ?? "");
    setFeedback(existingReview?.feedback ?? "");
    setDialogOpen(true);
  };

  const handleSaveReview = () => {
    if (!selectedStudentId || !selectedSubject) {
      toast.error("Select a subject and student before saving.");
      return;
    }

    const parsedMarks = Number.parseInt(marks, 10);
    if (Number.isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      toast.error("Enter marks between 0 and 100.");
      return;
    }

    const nextReviews = [...getReviews()];
    const existingIndex = nextReviews.findIndex(
      (review) =>
        review.studentId === selectedStudentId && review.subjectId === selectedSubject && review.facultyId === user.id,
    );
    const nextReview: ReviewRecord = {
      id: existingIndex >= 0 ? nextReviews[existingIndex].id : `review_${Date.now()}`,
      studentId: selectedStudentId,
      subjectId: selectedSubject,
      facultyId: user.id,
      marks: parsedMarks,
      feedback,
      status: "completed",
      date: new Date().toISOString().split("T")[0],
      attendance: true,
    };

    if (existingIndex >= 0) nextReviews[existingIndex] = nextReview;
    else nextReviews.push(nextReview);

    setReviews(nextReviews);
    refreshDashboardData();
    addNotification({
      title: `Review saved for ${selectedStudent?.name ?? "student"}`,
      description: `${selectedSubjectRecord?.name ?? "Selected subject"} now includes updated feedback and marks.`,
      href: "/reviews",
      kind: "review",
    });
    setReviewVersion((current) => current + 1);
    setDialogOpen(false);
    toast.success("Review saved successfully.");
  };

  const selectedStudentFiles =
    selectedStudentId && selectedSubject
      ? getFiles().filter((file) => file.studentId === selectedStudentId && file.subjectId === selectedSubject)
      : [];
  const aiSubmissionContext = [
    selectedStudent ? `Student ${selectedStudent.name}` : "",
    selectedSubjectRecord ? `Subject ${selectedSubjectRecord.name}` : "",
    marks ? `Draft marks ${marks}` : "",
    selectedStudentFiles.length > 0
      ? `Uploaded files: ${selectedStudentFiles.map((file) => file.fileName).join(", ")}`
      : "No uploaded files are available for this subject yet.",
    feedback ? `Existing feedback: ${feedback}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Review Center</h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Evaluate students subject-by-subject, track progress, and finalize marks with readable light and dark surfaces.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="field-surface h-12 rounded-2xl">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            {subjects.map((subject) => (
              <SelectItem
                key={subject.id}
                value={subject.id}
                className="cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:text-white"
              >
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name or registration number"
            className="field-surface h-12 rounded-2xl pl-11"
          />
        </div>
      </div>

      {selectedSubject ? (
        <>
          {routeLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`reviews-stat-skeleton-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-4 h-8 w-16" />
                    <Skeleton className="mt-4 h-10 w-10 rounded-xl" />
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-6 w-48" />
                <div className="mt-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={`review-row-skeleton-${index}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-28 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard title="Completed" value={completedCount} icon={CheckCircle2} variant="success" />
                <StatCard title="In Progress" value={inProgressCount} icon={Clock3} variant="warning" />
                <StatCard title="Not Reviewed" value={notReviewedCount} icon={AlertCircle} variant="danger" />
              </div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="glass-card-elevated overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedSubjectRecord?.name}</h2>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedSubjectRecord?.isLSM ? "Cabin review mode" : "Presentation review mode"}
                    </p>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                        <TableHead className="text-slate-700 dark:text-slate-300">Student</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300">Registration</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300">Marks</TableHead>
                        <TableHead className="text-right text-slate-700 dark:text-slate-300">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const review = getReview(student.id);
                        const status = review?.status ?? "not_submitted";

                        return (
                          <TableRow key={student.id} className="border-slate-200 dark:border-slate-800">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <UserAvatar user={student} className="h-11 w-11" fallbackClassName="text-sm" />
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{student.department}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">{student.regNo}</TableCell>
                            <TableCell><StatusBadge status={status} /></TableCell>
                            <TableCell className="font-semibold text-purple-700 dark:text-purple-300">
                              {review?.marks != null ? `${review.marks}/100` : "Pending"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => openReviewDialog(student.id)}
                                className="cursor-pointer rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                              >
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                {review?.status === "completed" ? "Edit Review" : "Start Review"}
                              </Button>
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
        </>
      ) : (
        <div className="glass-card-elevated rounded-[28px] border border-slate-200 px-6 py-16 text-center dark:border-slate-800">
          <ClipboardCheck className="mx-auto h-12 w-12 text-slate-500 dark:text-slate-400" />
          <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">Select a subject to begin reviewing students.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-[28px] border-slate-200 bg-white sm:max-w-lg dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {selectedSubjectRecord?.isLSM ? "Cabin Review" : "Presentation Review"}
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <UserAvatar user={selectedStudent} className="h-14 w-14 rounded-2xl" fallbackClassName="text-sm" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedStudent.regNo}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Marks (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={marks}
                  onChange={(event) => setMarks(event.target.value)}
                  className="field-surface h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Add faculty notes for the student"
                  rows={4}
                  className="field-surface rounded-2xl"
                />
              </div>
              <AIFeedback
                contextKey={`${selectedStudentId ?? "none"}-${selectedSubject}-${marks}`}
                submissionText={aiSubmissionContext}
                studentName={selectedStudent.name}
                subjectName={selectedSubjectRecord?.name ?? "Selected Subject"}
                marks={Number.parseInt(marks || "0", 10)}
                onApplyFeedback={setFeedback}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <ExportPDF
                  student={selectedStudent}
                  facultyName={user.name}
                  reviews={getReviews()
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
                  className="h-12 flex-1 rounded-2xl border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                />
                <Button
                  onClick={handleSaveReview}
                  className="h-12 flex-1 rounded-2xl bg-purple-600 text-white hover:bg-purple-700"
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
