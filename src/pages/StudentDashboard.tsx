import { useAuth, getSubjects, getReviews } from "@/contexts/AuthContext";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { CalendarWidget } from "@/components/student-dashboard/CalendarWidget";
import { TaskPanel } from "@/components/student-dashboard/TaskPanel";
import { SubjectCarousel } from "@/components/student-dashboard/SubjectCarousel";
import { Charts } from "@/components/student-dashboard/Charts";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const subjects = getSubjects();
  const reviews = getReviews().filter(r => r.studentId === user.id);
  const pendingReviews = reviews.filter(r => r.status !== "completed").length;

  const marksData = reviews.map(r => ({
    subject: getSubjects().find(s => s.id === r.subjectId)?.name.slice(0, 12) || "Subject",
    marks: r.marks || 0,
  })).slice(0, 6);

  const progressData = [
    { month: "Jan", marks: 65 },
    { month: "Feb", marks: 72 },
    { month: "Mar", marks: 81 },
    { month: "Apr", marks: 88 },
  ];

  const heroSlides: HeroSlide[] = [
    {
      title: `Welcome back, ${user.name.split(" ")[0]} 👋`,
      subtitle: `You have ${pendingReviews} pending tasks today`,
      ctaText: "Start Reviewing",
      onCtaClick: () => navigate("/subjects"),
    },
    {
      title: "Track your performance 📊",
      subtitle: "Visualize completion rates and scores",
      ctaText: "View Analytics",
      onCtaClick: () => document.getElementById("analytics-section")?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      title: "Stay connected 💬",
      subtitle: "Chat with faculty instantly",
      ctaText: "Open Messages",
      onCtaClick: () => navigate("/messages"),
    }
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#020617] min-h-screen text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Hero globally top */}
      <div className="mb-8">
        <HeroSlider slides={heroSlides} />
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pb-12">

        {/* Main Grid: Sidebar (Calendar & Tasks) + Carousel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-8">
            <SubjectCarousel subjects={subjects} reviews={reviews} />
          </div>

          <div className="xl:col-span-1 flex flex-col gap-6">
            <CalendarWidget />
            <TaskPanel />
          </div>
        </div>

        {/* Performance Charts */}
        <div id="analytics-section" className="pt-4 pb-8">
          <Charts marksData={marksData} progressData={progressData} />
        </div>

      </div>
    </div>
  );
}