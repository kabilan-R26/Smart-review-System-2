
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth, getStudents, getSubjects, getReviews, setReviews, getFiles, getMessages, setMessages, ReviewRecord } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, User, BookOpen, FileText, MessageSquare, ClipboardCheck, Mail, Download, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [tick, setTick] = useState(0);

  // Get student from navigation state or from context
  const locationStudent = location.state?.student;
  const contextStudent = getStudents().find(s => s.id === id);
  const student = locationStudent || contextStudent;

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <User className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Student Not Found</h2>
        <p className="text-gray-400 max-w-md">The student you are looking for could not be found.</p>
        <Button 
          onClick={() => navigate(-1)} 
          className="mt-6 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const subjects = getSubjects().filter(s => s.facultyId === user?.id);
  const reviews = getReviews().filter(r => r.studentId === student.id);
  const files = getFiles().filter(f => f.studentId === student.id);
  const messages = getMessages().filter(m =>
    (m.senderId === user?.id && m.receiverId === student.id) ||
    (m.senderId === student.id && m.receiverId === user?.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // ... rest of your existing functions (handleSubmitReview, handleSendMessage, etc.)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <UserAvatar user={student} className="h-16 w-16 rounded-2xl" fallbackClassName="text-base" />
          <div>
            <h1 className="text-3xl font-bold text-white">{student.name}</h1>
            <p className="text-lg text-gray-400">{student.regNo} • {student.department}</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/5 rounded-2xl p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="glass-card-elevated rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <UserAvatar user={student} className="h-20 w-20" fallbackClassName="text-lg" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Student Profile</p>
                    <p className="mt-1 text-lg font-semibold text-white">DiceBear avatar with initials fallback</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Full Name</p>
                  <p className="text-2xl font-semibold text-white mt-1">{student.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Registration Number</p>
                  <p className="font-mono text-purple-300 text-xl">{student.regNo}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Department</p>
                  <p className="text-white">{student.department}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Attendance</p>
                <div className="flex items-center gap-6">
                  <div className="text-6xl font-bold text-purple-300">{student.attendance || 0}<span className="text-2xl">%</span></div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${student.attendance || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* You can expand other tabs later */}
        <TabsContent value="academic">
          <div className="glass-card-elevated rounded-3xl p-8 text-center py-12">
            <p className="text-gray-400">Academic performance details coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <div className="glass-card-elevated rounded-3xl p-8 text-center py-12">
            <p className="text-gray-400">Uploaded files will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="glass-card-elevated rounded-3xl p-8 text-center py-12">
            <p className="text-gray-400">Messaging section coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
