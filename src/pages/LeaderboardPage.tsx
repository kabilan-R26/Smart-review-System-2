import { motion } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";
import { getReviews, getStudents, useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Skeleton } from "@/components/Skeleton";
import { useDashboardState } from "@/contexts/DashboardStateContext";

const PODIUM_STYLES = [
  {
    rank: 1,
    label: "Gold",
    cardClassName: "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 dark:border-amber-400/30 dark:from-amber-500/12 dark:to-yellow-400/12",
    iconClassName: "text-amber-500",
  },
  {
    rank: 2,
    label: "Silver",
    cardClassName: "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-200 dark:border-slate-500/30 dark:from-slate-500/12 dark:to-slate-400/12",
    iconClassName: "text-slate-500 dark:text-slate-300",
  },
  {
    rank: 3,
    label: "Bronze",
    cardClassName: "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100 dark:border-orange-400/30 dark:from-orange-500/12 dark:to-amber-500/12",
    iconClassName: "text-orange-500",
  },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { routeLoading } = useDashboardState();

  if (!user) return null;

  const facultyReviews = getReviews().filter(
    (review) => review.facultyId === user.id && review.status === "completed" && typeof review.marks === "number",
  );

  const leaderboard = getStudents()
    .map((student) => {
      const studentReviews = facultyReviews.filter((review) => review.studentId === student.id);
      const totalMarks = studentReviews.reduce((sum, review) => sum + (review.marks ?? 0), 0);
      const averageMarks = totalMarks / Math.max(studentReviews.length, 1);

      return {
        id: student.id,
        name: student.name,
        marks: Math.round(averageMarks || 0),
        reviewCount: studentReviews.length,
        student,
      };
    })
    .filter((entry) => entry.reviewCount > 0)
    .sort((left, right) => right.marks - left.marks || right.reviewCount - left.reviewCount || left.name.localeCompare(right.name))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  if (routeLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`leaderboard-podium-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="mx-auto h-16 w-16 rounded-full" />
              <Skeleton className="mx-auto mt-4 h-5 w-32" />
              <Skeleton className="mx-auto mt-3 h-8 w-20" />
            </div>
          ))}
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`leaderboard-row-${index}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
          <Trophy className="h-3.5 w-3.5" />
          Leaderboard
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Performance Leaderboard</h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Rankings are based on average completed-review marks across your evaluated students.
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Trophy className="mx-auto h-12 w-12 text-slate-500 dark:text-slate-400" />
          <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">Complete a few reviews to populate the leaderboard.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {topThree.map((entry, index) => {
              const style = PODIUM_STYLES[index];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  className={`rounded-[28px] border p-6 shadow-sm ${style.cardClassName}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{style.label}</p>
                      <p className="mt-2 text-4xl font-black text-slate-900 dark:text-white">#{entry.rank}</p>
                    </div>
                    {entry.rank === 1 ? <Crown className={`h-8 w-8 ${style.iconClassName}`} /> : <Medal className={`h-8 w-8 ${style.iconClassName}`} />}
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <UserAvatar user={entry.student} className="h-16 w-16 border-4 border-white dark:border-slate-900" fallbackClassName="text-lg" />
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{entry.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{entry.reviewCount} reviewed submissions</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white/70 px-4 py-3 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Average Marks</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{entry.marks}/100</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {remaining.length > 0 && (
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Full Rankings</h2>
              <div className="space-y-3">
                {remaining.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + index * 0.04 }}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {entry.rank}
                    </div>
                    <UserAvatar user={entry.student} className="h-12 w-12" fallbackClassName="text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{entry.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{entry.reviewCount} reviewed submissions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{entry.marks}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">marks</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
