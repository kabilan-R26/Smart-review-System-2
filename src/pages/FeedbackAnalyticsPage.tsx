import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HeroSlider, type HeroSlide } from "@/components/HeroSlider";
import { Skeleton } from "@/components/Skeleton";
import { getReviews, getStudents, getSubjects, useAuth } from "@/contexts/AuthContext";
import { useDashboardState } from "@/contexts/DashboardStateContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function FeedbackAnalyticsPage() {
  const { user } = useAuth();
  const { routeLoading } = useDashboardState();
  const { theme } = useTheme();

  if (!user) return null;

  const subjects = getSubjects().filter((subject) => subject.facultyId === user.id);
  const reviews = getReviews().filter((review) => review.facultyId === user.id);
  const allStudents = getStudents();
  const completed = reviews.filter((review) => review.status === "completed").length;
  const pending = reviews.filter((review) => review.status === "review_submitted").length;
  const totalCombinations = subjects.length * allStudents.length;
  const notReviewed = Math.max(totalCombinations - completed - pending, 0);
  const reviewsWithMarks = reviews.filter((review) => typeof review.marks === "number");
  const averageMarks = reviewsWithMarks.reduce((sum, review) => sum + (review.marks ?? 0), 0) / Math.max(reviewsWithMarks.length, 1);

  const pieData = [
    { name: "Completed", value: completed, fill: "#8b5cf6" },
    { name: "In Progress", value: pending, fill: "#f59e0b" },
    { name: "Not Reviewed", value: notReviewed, fill: "#ef4444" },
  ];

  const subjectData = subjects.map((subject) => {
    const subjectReviews = reviews.filter((review) => review.subjectId === subject.id);
    const markedReviews = subjectReviews.filter((review) => typeof review.marks === "number");
    const average =
      markedReviews.reduce((sum, review) => sum + (review.marks ?? 0), 0) / Math.max(markedReviews.length, 1);

    return {
      name: subject.name.length > 14 ? `${subject.name.slice(0, 14)}...` : subject.name,
      avgMarks: Math.round(average || 0),
    };
  });

  const heroSlides: HeroSlide[] = [
    {
      title: "Performance Insights",
      subtitle: "Visualize review completion, average marks, and subject-level trends at a glance.",
      ctaText: "Jump to Charts",
      onCtaClick: () => document.getElementById("analytics-dashboard")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      title: "Data-Driven Evaluation",
      subtitle: "Use clear charts to spot bottlenecks, monitor pending reviews, and improve faculty response time.",
    },
  ];

  const axisColor = theme === "dark" ? "#94a3b8" : "#475569";
  const gridColor = theme === "dark" ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.24)";
  const tooltipStyle = {
    background: theme === "dark" ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
    border: "none",
    borderRadius: "16px",
    color: theme === "dark" ? "#f8fafc" : "#0f172a",
    boxShadow: "0 20px 40px rgba(15,23,42,0.18)",
    fontWeight: 600,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mb-6">
        <HeroSlider slides={heroSlides} />
      </div>

      <div id="analytics-dashboard" className="mx-auto mt-4 max-w-[1400px] space-y-8 px-4 sm:px-6 lg:px-8">
        {routeLoading ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`analytics-stat-skeleton-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-6 h-10 w-24" />
                  <Skeleton className="mt-6 h-12 w-12 rounded-2xl" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={`analytics-chart-skeleton-${index}`} className="rounded-[30px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="mt-6 h-80 w-full rounded-[28px]" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Reviews",
                  value: reviews.length,
                  icon: BarChart3,
                  gradient: "from-purple-500 to-indigo-600",
                  shadow: "shadow-purple-500/25",
                },
                {
                  title: "Completed",
                  value: completed,
                  icon: CheckCircle2,
                  gradient: "from-emerald-400 to-teal-500",
                  shadow: "shadow-emerald-500/25",
                },
                {
                  title: "Pending",
                  value: pending,
                  icon: Clock3,
                  gradient: "from-amber-400 to-orange-500",
                  shadow: "shadow-amber-500/25",
                },
                {
                  title: "Average Marks",
                  value: `${Math.round(averageMarks || 0)}/100`,
                  icon: TrendingUp,
                  gradient: "from-pink-500 to-rose-500",
                  shadow: "shadow-pink-500/25",
                },
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${card.gradient} p-6 text-white shadow-xl ${card.shadow}`}
                >
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{card.title}</p>
                      <h2 className="mt-6 text-4xl font-black tracking-tight">{card.value}</h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 backdrop-blur-sm">
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <div className="glass-card-elevated rounded-[30px] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Completion Status</h3>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Distribution of completed, pending, and untouched reviews.</p>
                    </div>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                      Donut Chart
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="relative h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={112}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                            labelLine={false}
                            label={({ name, percent }) => (percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : "")}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`${entry.name}-${index}`} fill={entry.fill} className="cursor-pointer transition-opacity hover:opacity-85" />
                            ))}
                          </Pie>
                          <Tooltip cursor={false} contentStyle={tooltipStyle} itemStyle={{ color: tooltipStyle.color }} />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{reviews.length}</span>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total Reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <div className="glass-card-elevated rounded-[30px] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Subject Averages</h3>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Average marks by subject with light-theme-safe axis and tooltip colors.</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      Bar Chart
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectData.length > 0 ? subjectData : [{ name: "No Data", avgMarks: 0 }]} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis domain={[0, 100]} tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: theme === "dark" ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.06)" }}
                            contentStyle={tooltipStyle}
                            itemStyle={{ color: theme === "dark" ? "#c4b5fd" : "#7c3aed" }}
                          />
                          <Bar dataKey="avgMarks" name="Average Marks" radius={[10, 10, 10, 10]} barSize={44}>
                            {subjectData.map((entry, index) => (
                              <Cell key={`${entry.name}-${index}`} fill="url(#analyticsBarGradient)" />
                            ))}
                          </Bar>
                          <defs>
                            <linearGradient id="analyticsBarGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c084fc" />
                              <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
