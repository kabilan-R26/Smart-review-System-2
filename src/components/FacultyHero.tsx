import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

interface FacultyHeroProps {
  userName: string;
  totalSubjects: number;
  totalStudents: number;
  completionRate: number;
}

export function FacultyHero({ userName, totalSubjects, totalStudents, completionRate }: FacultyHeroProps) {
  return (
    <div className="h-full min-h-[280px] bg-white dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-2xl p-8 overflow-hidden relative shadow-sm">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        <SwiperSlide className="flex flex-col justify-center h-full">
          <div className="space-y-4 my-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Dr. {userName}</span> 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your academic classes and student reviews</p>
          </div>
        </SwiperSlide>
        
        <SwiperSlide className="flex flex-col justify-center h-full">
          <div className="space-y-6 my-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Overview Stats</h2>
            <div className="flex justify-center items-center gap-2">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalSubjects} Subjects</p>
              <span className="text-2xl text-gray-400">•</span>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalStudents} Students</p>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide className="flex flex-col justify-center h-full">
          <div className="space-y-6 my-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluation Progress</h2>
             <div className="flex justify-center items-center gap-4">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</p>
              <p className="text-2xl font-medium text-gray-800 dark:text-gray-200">Reviews Completed</p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
