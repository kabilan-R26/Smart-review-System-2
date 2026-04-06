import React, { createContext, useContext, useState, useCallback } from "react";
import { getTaskStatus, type TaskStatus } from "@/lib/task-utils";

export type UserRole = "faculty" | "student";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  regNo?: string;
  facultyId?: string;
  email: string;
  attendance?: number;
  profileImage?: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateAttendance() {
  return Math.floor(Math.random() * 30) + 70;
}

const STUDENT_NAMES: string[] = [
  "Aarav Sharma", "Priya Patel", "Sneha Reddy", "Aditya Verma", "Kavya Menon",
  "Rohan Desai", "Ishita Joshi", "Arjun Malhotra", "Diya Kapoor", "Karthik Rajan",
  "Nisha Agarwal", "Siddharth Rao", "Megha Tiwari", "Varun Chopra", "Pooja Saxena",
  "Nikhil Bhat", "Shreya Mishra", "Amit Kulkarni", "Ritu Chauhan", "Pranav Shetty",
  "Rahul Kumar", "Vikram Singh", "Tanvi Pillai", "Harsh Mehta", "Swati Pandey",
  "Manish Dubey", "Anjali Nambiar", "Deepak Thakur", "Simran Kaur", "Rajesh Iyer",
  "Divya Srinivasan", "Akash Gowda", "Neha Bhatt", "Suresh Naik", "Pallavi Hegde",
  "Vivek Choudhary", "Lakshmi Rao", "Gaurav Jain", "Bhavna Sethi", "Tarun Prasad",
  "Ananya Gupta", "Ravi Shankar", "Meera Krishnan", "Ajay Patil", "Sonal Deshmukh",
  "Kunal Banerjee", "Aditi Mukherjee", "Sanjay Rawat", "Kritika Sen", "Mohit Yadav",
  "Revathi Sundaram", "Abhishek Dixit", "Jyoti Bose", "Pankaj Tripathi", "Rina Das",
  "Vishal Chandra", "Namrata Ghosh", "Hemant Shukla", "Aparna Nair", "Kabilan Raj",
];

function makeStudentEmail(name: string, year: number): string {
  const first = name.split(" ")[0].toLowerCase();
  return `${first}.${year}@vitstudent.ac.in`;
}

function makeFacultyEmail(name: string): string {
  // e.g. "Dr. Meera Iyer" → "meera.i@vitfaculty.ac.in"
  const parts = name.replace(/^(Dr\.|Prof\.) ?/, "").trim().split(" ");
  const first = parts[0].toLowerCase();
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0].toLowerCase() : "";
  return `${first}.${lastInitial}@vitfaculty.ac.in`;
}

function getDefaultPassword(email: string): string {
  return email.split("@")[0];
}

const MOCK_USERS: User[] = [
  ...STUDENT_NAMES.map((name, i) => {
    const email = makeStudentEmail(name, 2024);
    return {
      id: `s${i + 1}`,
      name,
      role: "student" as UserRole,
      department: "Computer Science",
      regNo: `CS2024${String(i + 1).padStart(3, "0")}`,
      email,
      attendance: generateAttendance(),
      mustChangePassword: true,
    };
  }),
  {
    id: "f1", name: "Dr. Kamesh R", role: "faculty", department: "Computer Science",
    facultyId: "FAC001", email: "kamesh.r@vitfaculty.ac.in", mustChangePassword: true,
  },
  {
    id: "f2", name: "Dr. Meera S", role: "faculty", department: "Computer Science",
    facultyId: "FAC002", email: "meera.s@vitfaculty.ac.in", mustChangePassword: true,
  },
  {
    id: "f3", name: "Dr. Ravi Kumar", role: "faculty", department: "Computer Science",
    facultyId: "FAC003", email: "ravi.k@vitfaculty.ac.in", mustChangePassword: true,
  },
];

// Password store: email → password (default = text before @)
const passwordStore: Record<string, string> = {};
MOCK_USERS.forEach(u => { passwordStore[u.email] = getDefaultPassword(u.email); });

// Track which users changed password
const changedPasswordSet = new Set<string>();

export interface Subject {
  id: string;
  name: string;
  facultyId: string;
  isLSM?: boolean;
}

let subjectStore: Subject[] = [
  { id: "c1", name: "Data Structures & Algorithms", facultyId: "f1" },
  { id: "c2", name: "Database Management Systems", facultyId: "f1" },
  { id: "c3", name: "Digital Signal Processing", facultyId: "f2" },
  { id: "c4", name: "Machine Learning", facultyId: "f1" },
  { id: "c5", name: "Software Engineering", facultyId: "f2" },
  { id: "c_lsm", name: "LSM (Lean Startup Management)", facultyId: "f1", isLSM: true },
];

export function getSubjects() { return subjectStore; }
export function setSubjects(s: Subject[]) { subjectStore = s; }

export type CompletionStatus = "not_submitted" | "review_submitted" | "completed";

export interface ReviewRecord {
  id: string;
  studentId: string;
  subjectId: string;
  facultyId: string;
  marks?: number;
  feedback?: string;
  status: CompletionStatus;
  date: string;
  attendance?: boolean;
}

export interface FileRecord {
  id: string;
  studentId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  subjectId?: string;
  uploadUrl?: string;
}

export interface MessageRecord {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface TaskRecord {
  id: string;
  title: string;
  subjectId: string;
  facultyId: string;
  deadline: string;
  createdAt: string;
  completedAt?: string | null;
  status: TaskStatus;
}

const INITIAL_REVIEWS: ReviewRecord[] = [
  { id: "r1", studentId: "s1", subjectId: "c1", facultyId: "f1", marks: 85, feedback: "Excellent understanding of trees and graphs", status: "completed", date: "2024-11-15", attendance: true },
  { id: "r2", studentId: "s2", subjectId: "c1", facultyId: "f1", marks: 72, feedback: "Good but needs more practice", status: "completed", date: "2024-11-15", attendance: true },
  { id: "r3", studentId: "s3", subjectId: "c1", facultyId: "f1", status: "review_submitted", date: "2024-11-15", attendance: true },
  { id: "r4", studentId: "s4", subjectId: "c1", facultyId: "f1", status: "not_submitted", date: "2024-11-15" },
  { id: "r5", studentId: "s1", subjectId: "c4", facultyId: "f1", marks: 90, feedback: "Outstanding ML project", status: "completed", date: "2024-11-17", attendance: true },
  { id: "r6", studentId: "s5", subjectId: "c4", facultyId: "f1", marks: 78, feedback: "Good progress in ML", status: "completed", date: "2024-11-17", attendance: true },
  { id: "r7", studentId: "s1", subjectId: "c_lsm", facultyId: "f1", marks: 88, feedback: "Excellent cabin review presentation", status: "completed", date: "2024-11-20", attendance: true },
  { id: "r8", studentId: "s2", subjectId: "c_lsm", facultyId: "f1", status: "review_submitted", date: "2024-11-20", attendance: true },
  { id: "r9", studentId: "s7", subjectId: "c2", facultyId: "f1", marks: 92, feedback: "Top performer in DBMS", status: "completed", date: "2024-11-16", attendance: true },
  { id: "r10", studentId: "s21", subjectId: "c3", facultyId: "f2", marks: 80, feedback: "Good understanding of DSP", status: "completed", date: "2024-11-18", attendance: true },
];

const INITIAL_FILES: FileRecord[] = [
  { id: "file1", studentId: "s1", fileName: "ML_Project_Report.pdf", fileType: "pdf", fileSize: "2.4 MB", uploadDate: "2024-11-18", subjectId: "c4" },
  { id: "file2", studentId: "s1", fileName: "DSA_Presentation.pptx", fileType: "ppt", fileSize: "5.1 MB", uploadDate: "2024-11-15", subjectId: "c1" },
  { id: "file3", studentId: "s2", fileName: "Database_Design.pdf", fileType: "pdf", fileSize: "1.8 MB", uploadDate: "2024-11-16", subjectId: "c2" },
  { id: "file4", studentId: "s7", fileName: "DBMS_Report.pdf", fileType: "pdf", fileSize: "3.2 MB", uploadDate: "2024-11-17", subjectId: "c2" },
];

const INITIAL_TASKS: TaskRecord[] = [
  {
    id: "task1",
    title: "ML Project Submission",
    subjectId: "c4",
    facultyId: "f1",
    deadline: "2026-04-10",
    createdAt: "2026-04-01T09:00:00.000Z",
    completedAt: null,
    status: "pending",
  },
  {
    id: "task2",
    title: "DBMS Schema Review",
    subjectId: "c2",
    facultyId: "f1",
    deadline: "2026-04-06",
    createdAt: "2026-04-03T10:30:00.000Z",
    completedAt: null,
    status: "pending",
  },
  {
    id: "task3",
    title: "DSA Lab Evaluation",
    subjectId: "c1",
    facultyId: "f1",
    deadline: "2026-04-03",
    createdAt: "2026-03-30T15:15:00.000Z",
    completedAt: null,
    status: "pending",
  },
  {
    id: "task4",
    title: "LSM Pitch Deck Review",
    subjectId: "c_lsm",
    facultyId: "f1",
    deadline: "2026-04-02",
    createdAt: "2026-03-29T11:00:00.000Z",
    completedAt: "2026-04-01T16:40:00.000Z",
    status: "completed",
  },
  {
    id: "task5",
    title: "DSP Case Study Upload",
    subjectId: "c3",
    facultyId: "f2",
    deadline: "2026-04-08",
    createdAt: "2026-04-02T08:20:00.000Z",
    completedAt: null,
    status: "pending",
  },
];

/** Sample thread per faculty (faculty line, then student reply) — seeded for every student so the Messages UI always has history. */
const SEED_THREAD_BY_FACULTY: Record<string, [string, string]> = {
  f1: ["Submit your project report by tomorrow.", "Okay sir, I will upload it."],
  f2: ["Please attend the extra class on Saturday if possible.", "Sure ma'am, I will be there."],
  f3: ["Your recent assignment was graded — good work.", "Thank you sir!"],
};

function buildInitialMessages(): MessageRecord[] {
  const students = MOCK_USERS.filter(u => u.role === "student");
  const facultyIds = ["f1", "f2", "f3"] as const;
  const out: MessageRecord[] = [];
  let day = 10;
  for (const s of students) {
    for (const fid of facultyIds) {
      const [facultyMsg, studentMsg] = SEED_THREAD_BY_FACULTY[fid];
      const base = `seed_${s.id}_${fid}`;
      out.push({
        id: `${base}_a`,
        senderId: fid,
        receiverId: s.id,
        message: facultyMsg,
        timestamp: `2024-11-${String(day % 20 + 10).padStart(2, "0")}T10:15:00`,
        read: true,
      });
      out.push({
        id: `${base}_b`,
        senderId: s.id,
        receiverId: fid,
        message: studentMsg,
        timestamp: `2024-11-${String(day % 20 + 10).padStart(2, "0")}T10:18:00`,
        read: true,
      });
      day++;
    }
  }
  return out;
}

const INITIAL_MESSAGES: MessageRecord[] = buildInitialMessages();

function syncTaskRecord(task: TaskRecord): TaskRecord {
  return {
    ...task,
    completedAt: task.completedAt ?? null,
    status: getTaskStatus(task),
  };
}

let reviewStore = [...INITIAL_REVIEWS];
let fileStore = [...INITIAL_FILES];
let messageStore = [...INITIAL_MESSAGES];
let taskStore = INITIAL_TASKS.map(syncTaskRecord);

export function getReviews() { return reviewStore; }
export function setReviews(r: ReviewRecord[]) { reviewStore = r; }
export function getFiles() { return fileStore; }
export function setFiles(f: FileRecord[]) { fileStore = f; }
export function getMessages() { return messageStore; }
export function setMessages(m: MessageRecord[]) { messageStore = m; }
export function getTasks() {
  taskStore = taskStore.map(syncTaskRecord);
  return taskStore;
}
export function setTasks(tasks: TaskRecord[]) {
  taskStore = tasks.map(syncTaskRecord);
}
export function getStudents() { return MOCK_USERS.filter(u => u.role === "student"); }
export function getFaculty() { return MOCK_USERS.filter(u => u.role === "faculty"); }
export function getAllUsers() { return MOCK_USERS; }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData: any): { success: boolean; error?: string } => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return { success: true };
  }, []);

  const changePassword = useCallback((oldPass: string, newPass: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: "Not authenticated" };
    const storedPassword = passwordStore[user.email];
    if (storedPassword !== oldPass) {
      return { success: false, error: "Old password is incorrect" };
    }
    if (newPass.length < 4) {
      return { success: false, error: "New password must be at least 4 characters" };
    }
    passwordStore[user.email] = newPass;
    changedPasswordSet.add(user.email);
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
    return { success: true };
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
