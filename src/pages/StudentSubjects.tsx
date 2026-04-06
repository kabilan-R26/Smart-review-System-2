import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { getReviews, getSubjects, useAuth } from "@/contexts/AuthContext";
import { SubjectIcon } from "@/components/SubjectIcon";

export default function StudentSubjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const subjects = getSubjects();
  const reviews = useMemo(() => getReviews().filter((review) => review.studentId === user?.id), [user?.id]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Subjects</h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Open any subject to review feedback, messages, and uploaded documents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, index) => {
          const review = reviews.find((item) => item.subjectId === subject.id);
          const status = review?.status === "completed" ? "completed" : review?.status === "review_submitted" ? "submitted" : "pending";

          return (
            <motion.button
              key={subject.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/student/subject/${subject.id}`)}
              className="group cursor-pointer rounded-[28px] text-left transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
            >
              <div className="glass-card-elevated h-full rounded-[28px] border border-slate-200 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:border-purple-300 group-hover:shadow-[0_28px_60px_rgba(139,92,246,0.18)] dark:border-slate-800 dark:group-hover:border-purple-500/40">
                <div className="flex items-start justify-between gap-4">
                  <SubjectIcon subjectName={subject.name} className="h-14 w-14" />
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      subject.isLSM
                        ? "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/12 dark:text-cyan-300"
                        : "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/12 dark:text-purple-300"
                    }`}
                  >
                    {subject.isLSM ? "Cabin Review" : "Presentation"}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <h2 className="line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-purple-700 dark:text-white dark:group-hover:text-purple-300">
                    {subject.name}
                  </h2>
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Track your evaluation progress, faculty notes, and uploaded work for this subject.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {status === "completed" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Reviewed</span>
                      </>
                    ) : (
                      <>
                        <Clock3
                          className={`h-4 w-4 ${
                            status === "submitted" ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            status === "submitted"
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {status === "submitted" ? "Submitted" : "Pending"}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {review?.marks != null && (
                      <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {review.marks}
                        <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">/100</span>
                      </span>
                    )}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all group-hover:bg-purple-100 group-hover:text-purple-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-purple-500/15 dark:group-hover:text-purple-300">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
