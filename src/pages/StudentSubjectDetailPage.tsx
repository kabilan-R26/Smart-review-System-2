import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getFaculty,
  getFiles,
  getMessages,
  getReviews,
  getSubjects,
  setFiles,
  useAuth,
  type FileRecord,
} from "@/contexts/AuthContext";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Download, FileText, MessageSquare, Trash2, Upload, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDashboardState } from "@/contexts/DashboardStateContext";

type UploadStatus = "pending" | "uploading" | "uploaded" | "error";

interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

const UPLOAD_ENDPOINT = "/api/upload";
const PRODUCTION_FALLBACK_UPLOAD_ENDPOINT =
  import.meta.env.VITE_PRODUCTION_UPLOAD_URL ??
  "https://resourceful-exploration-production-73e9.up.railway.app/api/upload";

const ALLOWED_EXTENSIONS = new Set(["pdf", "ppt", "pptx", "doc", "docx"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedFile(file: File) {
  const extension = getFileExtension(file.name);
  return ALLOWED_EXTENSIONS.has(extension) || ALLOWED_MIME_TYPES.has(file.type);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveUploadUrl(rawUrl: string | undefined, endpoint: string) {
  if (!rawUrl) return undefined;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  try {
    const baseOrigin = endpoint.startsWith("http")
      ? new URL(endpoint).origin
      : window.location.origin;
    return new URL(rawUrl, baseOrigin).toString();
  } catch {
    return rawUrl;
  }
}

function getUploadEndpoints() {
  const endpoints = [UPLOAD_ENDPOINT];

  if (import.meta.env.PROD && UPLOAD_ENDPOINT.startsWith("/")) {
    endpoints.push(PRODUCTION_FALLBACK_UPLOAD_ENDPOINT);
  }

  return Array.from(new Set(endpoints.filter(Boolean)));
}

function createStoredFileRecord(
  file: File,
  studentId: string,
  subjectId: string,
  endpoint: string,
  payload?: { id?: string; url?: string; fileUrl?: string },
): FileRecord {
  return {
    id: payload?.id || `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    studentId,
    subjectId,
    fileName: file.name,
    fileType: getFileExtension(file.name) || file.type || "file",
    fileSize: formatFileSize(file.size),
    uploadDate: new Date().toISOString().split("T")[0],
    uploadUrl: resolveUploadUrl(payload?.url || payload?.fileUrl, endpoint),
  };
}

export default function StudentSubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification, refreshDashboardData } = useDashboardState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [, setFileVersion] = useState(0);

  if (!user || !id) return null;

  const subject = getSubjects().find((item) => item.id === id);
  const faculty = getFaculty().find((item) => item.id === subject?.facultyId);
  const review = getReviews().find((item) => item.studentId === user.id && item.subjectId === id);
  const files = getFiles().filter((item) => item.studentId === user.id && item.subjectId === id);
  const messages = getMessages().filter((item) => item.receiverId === user.id);

  if (!subject) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-700 dark:text-slate-300">Subject not found.</p>
        <Button variant="ghost" className="mt-4 text-purple-600 dark:text-purple-400" onClick={() => navigate("/subjects")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
        </Button>
      </div>
    );
  }

  const statusColor =
    review?.status === "completed"
      ? "text-emerald-600 dark:text-emerald-400"
      : review?.status === "review_submitted"
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-500 dark:text-slate-400";

  const statusLabel =
    review?.status === "completed"
      ? "Completed"
      : review?.status === "review_submitted"
        ? "Submitted"
        : "Not Reviewed";

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const updateQueueItem = (queueId: string, updater: (item: UploadQueueItem) => UploadQueueItem) => {
    setUploadQueue((current) => current.map((item) => (item.id === queueId ? updater(item) : item)));
  };

  const removeQueueItem = (queueId: string) => {
    setUploadQueue((current) => current.filter((item) => item.id !== queueId));
  };

  const addFilesToQueue = (incomingFiles: File[]) => {
    if (incomingFiles.length === 0) return;

    const invalidFiles = incomingFiles.filter((file) => !isAllowedFile(file));
    const validFiles = incomingFiles.filter((file) => isAllowedFile(file));

    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map((file) => file.name).join(", ");
      const message = `Unsupported file type: ${fileNames}. Only PDF, PPT, and DOC files are allowed.`;
      setValidationMessage(message);
      toast.error(message);
    } else {
      setValidationMessage(null);
    }

    if (validFiles.length === 0) return;

    setUploadQueue((current) => {
      const existingKeys = new Set(
        current.map((item) => `${item.file.name}_${item.file.size}_${item.file.lastModified}`),
      );

      const nextItems = validFiles
        .filter((file) => {
          const key = `${file.name}_${file.size}_${file.lastModified}`;
          if (existingKeys.has(key)) {
            toast.info(`${file.name} is already in the upload list.`);
            return false;
          }
          return true;
        })
        .map<UploadQueueItem>((file) => ({
          id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          file,
          progress: 0,
          status: "pending",
        }));

      return [...current, ...nextItems];
    });
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFilesToQueue(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    addFilesToQueue(Array.from(event.dataTransfer.files));
  };

  const uploadThroughEndpoint = (item: UploadQueueItem, endpoint: string) =>
    new Promise<FileRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("studentId", user.id);
      formData.append("subjectId", id);
      formData.append("subjectName", subject.name);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);

      xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;
        const progress = Math.round((event.loaded / event.total) * 100);
        updateQueueItem(item.id, (current) => ({ ...current, progress }));
      });

      xhr.addEventListener("load", () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
          return;
        }

        let payload: { id?: string; url?: string; fileUrl?: string } | undefined;
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
        } catch {
          payload = undefined;
        }

        resolve(createStoredFileRecord(item.file, user.id, id, endpoint, payload));
      });

      xhr.addEventListener("error", () => reject(new Error("Upload failed. Check your network or backend endpoint.")));
      xhr.send(formData);
    });

  const uploadSingleFile = async (item: UploadQueueItem) => {
    const endpoints = getUploadEndpoints();
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
      updateQueueItem(item.id, (current) => ({ ...current, progress: 0 }));
      try {
        return await uploadThroughEndpoint(item, endpoint);
      } catch (error) {
        lastError = error;
      }
    }

    throw (lastError instanceof Error
      ? lastError
      : new Error("Upload failed. No upload endpoint could be reached."));
  };

  const uploadSelectedFiles = async () => {
    const pendingItems = uploadQueue.filter((item) => item.status === "pending" || item.status === "error");
    if (pendingItems.length === 0) {
      toast.info("Select at least one valid file to upload.");
      return;
    }

    setIsUploading(true);

    for (const item of pendingItems) {
      updateQueueItem(item.id, (current) => ({
        ...current,
        status: "uploading",
        progress: current.progress || 0,
        error: undefined,
      }));

      try {
        const storedRecord = await uploadSingleFile(item);
        setFiles([...getFiles(), storedRecord]);
        refreshDashboardData();
        addNotification({
          title: `Upload complete: ${item.file.name}`,
          description: "Your file is now attached to this subject workspace.",
          href: `/student/subject/${id}`,
          kind: "upload",
        });
        setFileVersion((current) => current + 1);
        updateQueueItem(item.id, (current) => ({ ...current, status: "uploaded", progress: 100 }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        updateQueueItem(item.id, (current) => ({
          ...current,
          status: "error",
          error: message,
        }));
        toast.error(`${item.file.name}: ${message}`);
      }
    }

    setIsUploading(false);
  };

  const clearCompletedUploads = () => {
    setUploadQueue((current) => current.filter((item) => item.status !== "uploaded"));
  };

  const handleStoredFileDownload = (file: FileRecord) => {
    if (!file.uploadUrl) {
      toast.info("This file does not have a downloadable URL from the server yet.");
      return;
    }
    window.open(file.uploadUrl, "_blank", "noopener,noreferrer");
  };

  const handleDeleteStoredFile = (fileId: string) => {
    setFiles(getFiles().filter((item) => item.id !== fileId));
    refreshDashboardData();
    setFileVersion((current) => current + 1);
    toast.success("File removed from the local dashboard list.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          onClick={() => navigate("/subjects")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Subjects
        </Button>

        <div className="glass-card-elevated rounded-2xl p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <BookOpen className="h-7 w-7 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{subject.name}</h1>
                <div className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                    <User className="h-3 w-3" /> {faculty?.name || "Faculty"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      subject.isLSM
                        ? "border border-cyan-500/25 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                        : "border border-purple-500/25 bg-purple-500/15 text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    {subject.isLSM ? "Cabin Review" : "Presentation"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {review?.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              )}
              <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card-elevated h-full rounded-2xl">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Review & Marks</h3>
            </div>
            <div className="p-5">
              {review && review.status === "completed" ? (
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-purple-600 dark:text-purple-300">{review.marks ?? "--"}</span>
                    <span className="mb-2 text-sm text-slate-500 dark:text-slate-400">/100</span>
                  </div>
                  {review.feedback && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Faculty Feedback</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{review.feedback}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reviewed on {review.date}</p>
                </div>
              ) : review?.status === "review_submitted" ? (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-3 h-10 w-10 text-amber-500/60" />
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Review Submitted</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Awaiting faculty evaluation.</p>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">Not yet reviewed</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Faculty will review after submission.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="glass-card-elevated h-full rounded-2xl">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <MessageSquare className="h-4 w-4 text-cyan-500 dark:text-cyan-400" /> Messages
              </h3>
            </div>
            <div className="p-5">
              {messages.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">No messages yet</p>
                </div>
              ) : (
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {messages.slice(-5).reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-xl p-3 text-sm ${
                        message.read
                          ? "border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          : "border border-purple-500/20 bg-purple-500/10 text-slate-900 dark:text-white"
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="glass-card-elevated rounded-2xl">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">File Uploads</h3>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                Upload PDF, PPT, or DOC files through the browser file picker or drag and drop.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={openFilePicker} className="bg-purple-600 text-white hover:bg-purple-700">
                <Upload className="mr-2 h-4 w-4" /> Upload File
              </Button>
              <Button
                variant="outline"
                onClick={uploadSelectedFiles}
                disabled={isUploading || uploadQueue.length === 0}
                className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                {isUploading ? "Uploading..." : "Upload Selected"}
              </Button>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div
              onClick={openFilePicker}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                dragOver
                  ? "border-purple-500 bg-purple-50 shadow-inner dark:bg-purple-900/20"
                  : "border-slate-300 bg-white hover:border-purple-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
              }`}
            >
              <Upload className="mx-auto mb-3 h-10 w-10 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Drag and drop files here</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PDF, PPT, and DOC files only</p>
            </div>

            {validationMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {validationMessage}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Selected Files</h4>
                {uploadQueue.some((item) => item.status === "uploaded") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCompletedUploads}
                    className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  >
                    Clear Completed
                  </Button>
                )}
              </div>

              {uploadQueue.length === 0 ? (
                <p className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  No files selected yet.
                </p>
              ) : (
                uploadQueue.map((item) => {
                  const extension = getFileExtension(item.file.name).toUpperCase() || "FILE";
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.file.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatFileSize(item.file.size)} | {extension}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span
                                className={
                                  item.status === "uploaded"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : item.status === "error"
                                      ? "text-red-600 dark:text-red-400"
                                      : item.status === "uploading"
                                        ? "text-purple-600 dark:text-purple-400"
                                        : "text-slate-700 dark:text-slate-300"
                                }
                              >
                                {item.status === "pending"
                                  ? "Ready to upload"
                                  : item.status === "uploading"
                                    ? "Uploading"
                                    : item.status === "uploaded"
                                      ? "Uploaded"
                                      : "Upload failed"}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2 bg-slate-200 dark:bg-slate-800" />
                            {item.error && <p className="text-xs text-red-600 dark:text-red-400">{item.error}</p>}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {item.status === "error" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                              onClick={() =>
                                updateQueueItem(item.id, (current) => ({
                                  ...current,
                                  progress: 0,
                                  status: "pending",
                                  error: undefined,
                                }))
                              }
                            >
                              Retry
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => removeQueueItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Uploaded Files</h4>
              {files.length === 0 ? (
                <p className="text-center text-sm text-slate-700 dark:text-slate-300">No files uploaded for this subject yet.</p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 transition-all dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{file.fileName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {file.fileSize} | {file.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg p-0 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
                        onClick={() => handleStoredFileDownload(file)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg p-0 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20"
                        onClick={() => handleDeleteStoredFile(file.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

