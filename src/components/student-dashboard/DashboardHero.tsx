import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

interface DashboardHeroProps {
  userName: string;
  totalSubjects: number;
  pendingReviews: number;
}

export function DashboardHero({ userName, totalSubjects, pendingReviews }: DashboardHeroProps) {
  return (
    <div className="h-full min-h-[280px] bg-white dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-2xl p-8 overflow-hidden relative shadow-sm">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        <SwiperSlide className="flex flex-col justify-center h-full">
          <div className="space-y-4 my-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{userName}</span> 👋
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Track your academic performance</p>
          </div>
        </SwiperSlide>
        
        <SwiperSlide className="flex flex-col justify-center h-full">
          <div className="space-y-6 my-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h2>
            <div className="flex gap-6">
              <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">{totalSubjects}</p>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Subjects</p>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                <p className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-1">{pendingReviews}</p>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Pending Reviews</p>
              </div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide className="flex flex-col justify-center h-full">
          <div className="space-y-6 my-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Performance</h2>
             <div className="flex gap-6">
              <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">Rank: #3 🥉</p>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Current Standing</p>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                <p className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-1">Average: 82%</p>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Overall Score</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
