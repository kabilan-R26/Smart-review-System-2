import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, getSubjects, getReviews, getFiles, setFiles, getMessages, getFaculty } from "@/contexts/AuthContext";
import { ArrowLeft, BookOpen, Upload, FileText, Download, Trash2, CheckCircle, Clock, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function StudentSubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setTick] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [dragOver, setDragOver] = useState(false);

  if (!user || !id) return null;

  const subject = getSubjects().find(s => s.id === id);
  if (!subject) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-400">Subject not found</p>
      <Button variant="ghost" className="mt-4 text-purple-400" onClick={() => navigate("/subjects")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Subjects
      </Button>
    </div>
  );

  const faculty = getFaculty().find(f => f.id === subject.facultyId);
  const review = getReviews().find(r => r.studentId === user.id && r.subjectId === id);
  const files = getFiles().filter(f => f.studentId === user.id && f.subjectId === id);
  const messages = getMessages().filter(m => m.receiverId === user.id);

  const handleUpload = () => {
    if (!fileName.trim()) { toast.error("Enter file name"); return; }
    const store = getFiles();
    store.push({
      id: `file_${Date.now()}`,
      studentId: user.id,
      fileName: `${fileName}.${fileType}`,
      fileType,
      fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      subjectId: id,
    });
    setFiles(store);
    setFileName("");
    setTick(t => t + 1);
    toast.success("File uploaded successfully");
  };

  const handleDelete = (fileId: string) => {
    setFiles(getFiles().filter(f => f.id !== fileId));
    setTick(t => t + 1);
    toast.success("File deleted");
  };

  const statusColor = review?.status === "completed" ? "text-emerald-400" : review?.status === "review_submitted" ? "text-amber-400" : "text-gray-500";
  const statusLabel = review?.status === "completed" ? "Completed" : review?.status === "review_submitted" ? "Submitted" : "Not Reviewed";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mb-4 -ml-2" onClick={() => navigate("/subjects")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Subjects
        </Button>

        <div className="glass-card-elevated rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
                <BookOpen className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{subject.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="h-3 w-3" /> {faculty?.name || "Faculty"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    subject.isLSM ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25" : "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                  }`}>
                    {subject.isLSM ? "Cabin Review" : "Presentation"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {review?.status === "completed" ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Clock className="h-5 w-5 text-gray-500" />}
              <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card-elevated rounded-2xl h-full">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Review & Marks</h3>
            </div>
            <div className="p-5">
              {review && review.status === "completed" ? (
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-purple-300">{review.marks ?? "—"}</span>
                    <span className="text-sm text-gray-500 mb-2">/100</span>
                  </div>
                  {review.feedback && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Faculty Feedback</p>
                      <p className="text-sm text-gray-300">{review.feedback}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Reviewed on {review.date}</p>
                </div>
              ) : review?.status === "review_submitted" ? (
                <div className="text-center py-8">
                  <Clock className="h-10 w-10 text-amber-400/50 mx-auto mb-3" />
                  <p className="text-sm text-amber-400 font-medium">Review Submitted</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting faculty evaluation</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Not yet reviewed</p>
                  <p className="text-xs text-gray-600 mt-1">Faculty will review after submission</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="glass-card-elevated rounded-2xl h-full">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-400" /> Messages
              </h3>
            </div>
            <div className="p-5">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.slice(-5).reverse().map(msg => (
                    <div key={msg.id} className={`p-3 rounded-xl text-sm ${msg.read ? "bg-white/5 text-gray-300" : "bg-purple-500/10 border border-purple-500/20 text-gray-200"}`}>
                      <p>{msg.message}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* File Upload Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="glass-card-elevated rounded-2xl">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-semibold text-white">File Uploads</h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Drag & Drop */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); toast.info("Use the form below to upload"); }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragOver ? "border-purple-400 bg-purple-500/10" : "border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5"
              }`}
            >
              <Upload className="h-10 w-10 text-purple-400/60 mx-auto mb-3" />
              <p className="text-sm text-gray-300 font-medium">Drag & drop files here</p>
              <p className="text-xs text-gray-500 mt-1">PDF, PPT, DOC accepted</p>
            </div>

            {/* Upload form */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-gray-400 text-xs">File Name</Label>
                <Input
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="e.g. Project_Report"
                  className="rounded-xl h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                  onKeyDown={e => e.key === "Enter" && handleUpload()}
                />
              </div>
              <div className="w-full sm:w-28 space-y-1.5">
                <Label className="text-gray-400 text-xs">Type</Label>
                <select
                  value={fileType}
                  onChange={e => setFileType(e.target.value)}
                  className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
                >
                  <option value="pdf" className="bg-[#1e1b3a]">PDF</option>
                  <option value="ppt" className="bg-[#1e1b3a]">PPT</option>
                  <option value="doc" className="bg-[#1e1b3a]">DOC</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleUpload}
                  className="rounded-xl h-10 px-5 gradient-btn text-white text-sm font-medium hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Upload
                </button>
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Uploaded Files ({files.length})</p>
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{file.fileName}</p>
                        <p className="text-[11px] text-gray-500">{file.fileSize} · {file.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="rounded-lg text-cyan-400 hover:bg-cyan-500/20 h-8 w-8 p-0">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-lg text-red-400 hover:bg-red-500/20 h-8 w-8 p-0" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {files.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-2">No files uploaded for this subject yet</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
