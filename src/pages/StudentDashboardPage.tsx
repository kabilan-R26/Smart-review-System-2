import { useNavigate } from "react-router-dom";
import { HeroSlider, type HeroSlide } from "@/components/HeroSlider";
import { CalendarWidget } from "@/components/student-dashboard/CalendarWidget";
import { TaskPanelCard } from "@/components/student-dashboard/TaskPanelCard";
import { SubjectCarousel } from "@/components/student-dashboard/SubjectCarousel";
import { Charts } from "@/components/student-dashboard/Charts";
import { getReviews, getSubjects, useAuth } from "@/contexts/AuthContext";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const subjects = getSubjects();
  const reviews = getReviews().filter((review) => review.studentId === user.id);
  const pendingReviews = reviews.filter((review) => review.status !== "completed").length;

  const marksData = reviews
    .map((review) => ({
      subject: getSubjects().find((subject) => subject.id === review.subjectId)?.name.slice(0, 12) || "Subject",
      marks: review.marks || 0,
    }))
    .slice(0, 6);

  const progressData = [
    { month: "Jan", marks: 65 },
    { month: "Feb", marks: 72 },
    { month: "Mar", marks: 81 },
    { month: "Apr", marks: 88 },
  ];

  const heroSlides: HeroSlide[] = [
    {
      title: `Welcome back, ${user.name.split(" ")[0]}`,
      subtitle: `You have ${pendingReviews} pending tasks today`,
      ctaText: "Start Reviewing",
      onCtaClick: () => navigate("/subjects"),
    },
    {
      title: "Track your performance",
      subtitle: "Visualize completion rates and scores",
      ctaText: "View Analytics",
      onCtaClick: () => document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      title: "Stay connected",
      subtitle: "Chat with faculty instantly",
      ctaText: "Open Messages",
      onCtaClick: () => navigate("/messages"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mb-8">
        <HeroSlider slides={heroSlides} />
      </div>

      <div className="mx-auto max-w-[1400px] space-y-8 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <SubjectCarousel subjects={subjects} reviews={reviews} />
          </div>

          <div className="flex flex-col gap-6 xl:col-span-1">
            <CalendarWidget />
            <TaskPanelCard />
          </div>
        </div>

        <div id="analytics-section" className="pb-8 pt-4">
          <Charts marksData={marksData} progressData={progressData} />
        </div>
      </div>
    </div>
  );
}
