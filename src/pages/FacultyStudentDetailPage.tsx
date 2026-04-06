import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, Download, FileText, Mail, MessageSquare, User } from "lucide-react";
import { getFiles, getMessages, getReviews, getStudents, getSubjects, useAuth } from "@/contexts/AuthContext";
import { ExportPDF } from "@/components/ExportPDF";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { UserAvatar } from "@/components/UserAvatar";

export default function FacultyStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const locationStudent = location.state?.student;
  const contextStudent = getStudents().find((student) => student.id === id);
  const student = locationStudent || contextStudent;

  if (!student) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10">
          <User className="h-10 w-10 text-rose-600 dark:text-rose-300" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Student not found</h2>
        <p className="mt-2 max-w-md text-slate-700 dark:text-slate-300">
          The requested student record is unavailable or no longer exists in the current mock data set.
        </p>
        <Button onClick={() => navigate(-1)} className="mt-6 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const facultySubjects = getSubjects().filter((subject) => subject.facultyId === user?.id);
  const reviews = getReviews()
    .filter((review) => review.studentId === student.id && facultySubjects.some((subject) => subject.id === review.subjectId))
    .sort((left, right) => right.date.localeCompare(left.date));
  const files = getFiles().filter((file) => file.studentId === student.id);
  const messages = getMessages()
    .filter(
      (message) =>
        (message.senderId === user?.id && message.receiverId === student.id) ||
        (message.senderId === student.id && message.receiverId === user?.id),
    )
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

  const completedCount = reviews.filter((review) => review.status === "completed").length;
  const reviewsWithMarks = reviews.filter((review) => typeof review.marks === "number");
  const averageMarks =
    reviewsWithMarks.reduce((sum, review) => sum + (review.marks ?? 0), 0) / Math.max(reviewsWithMarks.length, 1);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="glass-card-elevated rounded-[32px] border border-slate-200 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar user={student} className="h-20 w-20 rounded-[28px]" fallbackClassName="text-xl" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {student.regNo} | {student.department}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/12 dark:text-sky-300">
                    Student Profile
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-300">
                    {completedCount} Completed Reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:w-[320px]">
              <ExportPDF
                student={student}
                facultyName={user?.name}
                reviews={reviews.map((review) => ({
                  subjectName: getSubjects().find((item) => item.id === review.subjectId)?.name ?? "Subject",
                  marks: review.marks,
                  feedback: review.feedback,
                  status: review.status,
                  date: review.date,
                }))}
                files={files}
                className="h-12 w-full rounded-2xl bg-purple-600 text-white hover:bg-purple-700"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Attendance</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{student.attendance ?? 0}%</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Average Marks</p>
                  <p className="mt-2 text-3xl font-bold text-purple-700 dark:text-purple-300">{Math.round(averageMarks || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="glass-card-elevated rounded-[28px] border border-slate-200 p-8 dark:border-slate-800">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <UserAvatar user={student} className="h-20 w-20 rounded-[28px]" fallbackClassName="text-lg" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Identity</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">DiceBear avatar with initials fallback</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Full Name</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{student.name}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Registration</p>
                    <p className="mt-2 text-lg font-semibold text-purple-700 dark:text-purple-300">{student.regNo}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Email</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{student.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Department</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{student.department}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Attendance</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-6xl font-bold text-slate-900 dark:text-white">{student.attendance ?? 0}</span>
                  <span className="pb-2 text-xl font-semibold text-slate-500 dark:text-slate-400">%</span>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500"
                    style={{ width: `${student.attendance ?? 0}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  Attendance is pulled from the mock data store and gives faculty a quick quality signal before reviewing files or messages.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          <div className="glass-card-elevated rounded-[28px] border border-slate-200 p-6 dark:border-slate-800">
            {reviews.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-500 dark:text-slate-400" />
                <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">No academic reviews have been recorded for this student yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                    <TableHead className="text-slate-700 dark:text-slate-300">Subject</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Marks</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => {
                    const subject = getSubjects().find((item) => item.id === review.subjectId);

                    return (
                      <TableRow key={review.id} className="border-slate-200 dark:border-slate-800">
                        <TableCell className="font-semibold text-slate-900 dark:text-white">{subject?.name ?? "Subject"}</TableCell>
                        <TableCell><StatusBadge status={review.status} /></TableCell>
                        <TableCell className="font-semibold text-purple-700 dark:text-purple-300">
                          {review.marks != null ? `${review.marks}/100` : "Pending"}
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{review.date}</TableCell>
                        <TableCell className="max-w-sm text-slate-700 dark:text-slate-300">{review.feedback ?? "No feedback yet"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="glass-card-elevated rounded-[28px] border border-slate-200 p-6 dark:border-slate-800">
            {files.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-500 dark:text-slate-400" />
                <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">No files have been uploaded for this student yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{file.fileName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{file.fileSize} | {file.uploadDate}</p>
                      </div>
                    </div>
                    {file.uploadUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                        onClick={() => window.open(file.uploadUrl, "_blank", "noopener,noreferrer")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stored locally</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <div className="glass-card-elevated rounded-[28px] border border-slate-200 p-6 dark:border-slate-800">
            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-slate-500 dark:text-slate-400" />
                <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">No conversation history is available with this student yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 8).map((message) => {
                  const outgoing = message.senderId === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${
                        outgoing
                          ? "ml-auto bg-purple-600 text-white"
                          : "border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                        {outgoing ? <Mail className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />}
                        <span>{outgoing ? "Faculty" : student.name.split(" ")[0]}</span>
                      </div>
                      <p className={`text-sm leading-6 ${outgoing ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>{message.message}</p>
                      <p className={`mt-2 text-[11px] ${outgoing ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

