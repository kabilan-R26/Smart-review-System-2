import { useAuth, getStudents, getSubjects, getReviews } from "@/contexts/AuthContext";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";

export default function FeedbackAnalytics() {
  const { user } = useAuth();
  if (!user) return null;

  const subjects = getSubjects().filter(s => s.facultyId === user.id);
  const reviews = getReviews().filter(r => r.facultyId === user.id);
  const allStudents = getStudents();

  const completed = reviews.filter(r => r.status === "completed").length;
  const pending = reviews.filter(r => r.status === "review_submitted").length;
  const notReviewed = (subjects.length * allStudents.length) - completed - pending;
  const avgMarks = reviews.filter(r => r.marks != null).length > 0
    ? Math.round(reviews.filter(r => r.marks != null).reduce((sum, r) => sum + (r.marks || 0), 0) / reviews.filter(r => r.marks != null).length)
    : 0;

  const pieData = [
    { name: "Completed", value: completed, fill: "#8b5cf6" }, // Purple
    { name: "In Progress", value: pending, fill: "#f59e0b" }, // Amber
    { name: "Not Reviewed", value: notReviewed > 0 ? notReviewed : 0, fill: "#ef4444" }, // Red
  ];

  const subjectData = subjects.map(s => {
    const subReviews = reviews.filter(r => r.subjectId === s.id);
    const avg = subReviews.filter(r => r.marks != null).length > 0
      ? Math.round(subReviews.filter(r => r.marks != null).reduce((sum, r) => sum + (r.marks || 0), 0) / subReviews.filter(r => r.marks != null).length)
      : 0;
    return { name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name, avgMarks: avg };
  });

  const heroSlides: HeroSlide[] = [
    {
      title: "Performance Insights 📊",
      subtitle: "Visualize student progress and track completion dynamics",
      ctaText: "View Reports",
      onCtaClick: () => document.getElementById("analytics-dashboard")?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      title: "Data-driven Decisions",
      subtitle: "Improve outcomes with detailed analytics and tracking",
    }
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#020617] min-h-screen text-[#0F172A] dark:text-[#F8FAFC] pb-20">
      <div className="mb-6">
        <HeroSlider slides={heroSlides} />
      </div>

      <div id="analytics-dashboard" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
        
        {/* 4 Gradient Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-500/30 flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <p className="text-white/80 font-semibold uppercase tracking-wider text-sm">Total Reviews</p>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Users className="w-5 h-5 text-white" /></div>
            </div>
            <h3 className="text-4xl font-extrabold relative z-10">{reviews.length}</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/30 flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <p className="text-white/80 font-semibold uppercase tracking-wider text-sm">Completed</p>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><CheckCircle className="w-5 h-5 text-white" /></div>
            </div>
            <h3 className="text-4xl font-extrabold relative z-10">{completed}</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-amber-500/30 flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <p className="text-white/80 font-semibold uppercase tracking-wider text-sm">Pending</p>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Clock className="w-5 h-5 text-white" /></div>
            </div>
            <h3 className="text-4xl font-extrabold relative z-10">{pending}</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 text-white shadow-lg shadow-pink-500/30 flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <p className="text-white/80 font-semibold uppercase tracking-wider text-sm">Average Marks</p>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><TrendingUp className="w-5 h-5 text-white" /></div>
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
               <h3 className="text-4xl font-extrabold">{avgMarks}</h3>
               <span className="text-white/70 font-semibold text-lg">/100</span>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Completion Status</h3>
                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full">Donut Map</span>
              </div>
              <div className="p-6">
                <div className="h-80 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        cx="50%" cy="50%" 
                        innerRadius={80} 
                        outerRadius={110} 
                        paddingAngle={6} 
                        dataKey="value"
                        stroke="none" 
                        animationBegin={200}
                        animationDuration={1500}
                        labelLine={false}
                        label={({ name, percent }) => percent > 0 ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` : ""}
                      >
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} className="hover:opacity-80 transition-opacity cursor-pointer outline-none hover:drop-shadow-lg" />)}
                      </Pie>
                      <Tooltip 
                         cursor={false}
                         contentStyle={{ background: "rgba(255, 255, 255, 0.95)", border: "none", borderRadius: "16px", color: "#0F172A", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontWeight: 600 }}
                         itemStyle={{ color: "#0F172A", fontWeight: "bold" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-extrabold text-[#0F172A] dark:text-white">{reviews.length}</span>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Subject Averages</h3>
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">Bar Analytics</span>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData.length ? subjectData : [{name: "No Data", avgMarks: 0}]} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.4}/>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: 'rgba(139, 92, 246, 0.05)', rx: 8}} 
                        contentStyle={{ background: "rgba(255, 255, 255, 0.95)", border: "none", borderRadius: "16px", color: "#0F172A", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontWeight: 600 }} 
                        itemStyle={{ color: "#8b5cf6" }} 
                      />
                      <Bar dataKey="avgMarks" name="Average Marks" radius={[8, 8, 8, 8]} barSize={45} animationBegin={300} animationDuration={1500}>
                         {
                           subjectData.map((_, index) => (
                             <Cell key={`cell-${index}`} fill="url(#barGradientPremium)" />
                           ))
                         }
                      </Bar>
                      <defs>
                        <linearGradient id="barGradientPremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#7e22ce" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
