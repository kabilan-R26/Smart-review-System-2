import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardStateProvider } from "@/contexts/DashboardStateContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import DashboardLayout from "@/components/DashboardLayoutShell";
import PortalSelect from "@/pages/PortalSelect";
import StudentLogin from "@/pages/StudentLoginPage";
import FacultyLogin from "@/pages/FacultyLoginPage";
import StudentRegisterPage from "@/pages/StudentRegisterPage";
import FacultyRegister from "@/pages/FacultyRegister";
import StudentDashboard from "@/pages/StudentDashboardPage";
import FacultyDashboard from "@/pages/FacultyDashboardPage";
import StudentDetailPage from "@/pages/FacultyStudentDetailPage";
import SubjectManagement from "@/pages/SubjectManagementPage";
import ReviewsPage from "@/pages/ReviewsDashboardPage";
import FeedbackAnalytics from "@/pages/FeedbackAnalyticsPage";
import MessagingPage from "@/pages/MessagingPageShell";
import StudentSubjects from "@/pages/StudentSubjects";
import StudentSubjectDetail from "@/pages/StudentSubjectDetailPage";
import Profile from "@/pages/Profile";
import LeaderboardPage from "@/pages/LeaderboardPage";
import TaskManager from "@/components/TaskManager";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/faculty-login" element={<FacultyLogin />} />
        <Route path="/student-register" element={<StudentRegisterPage />} />
        <Route path="/faculty-register" element={<FacultyRegister />} />
        <Route path="*" element={<PortalSelect />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        {user?.role === "student" && (
          <>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/subjects" element={<StudentSubjects />} />
            <Route path="/student/subject/:id" element={<StudentSubjectDetail />} />
            <Route path="/messages" element={<MessagingPage />} />
          </>
        )}
        {user?.role === "faculty" && (
          <>
            <Route path="/dashboard" element={<FacultyDashboard />} />
            <Route path="/subject/:subjectSlug" element={<FacultyDashboard />} />
            <Route path="/subjects" element={<SubjectManagement />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/analytics" element={<FeedbackAnalytics />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/student/:id" element={<StudentDetailPage />} />
          </>
        )}
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DashboardStateProvider>
              <AppRoutes />
            </DashboardStateProvider>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
