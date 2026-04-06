import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHero() {
  const { user } = useAuth();

  const slides = [
    {
      title: `Welcome back, ${user?.name.split(" ")[0] || "Student"} 👋`,
      subtitle: "Track your academic performance effortlessly",
      bg: "from-purple-600 to-indigo-600",
    },
    {
      title: "Your Academic Progress",
      subtitle: "6 Subjects • 2 Pending Reviews • Overall Rank #3",
      bg: "from-blue-600 to-cyan-600",
    },
    {
      title: "Keep Going!",
      subtitle: "You're doing great. Stay consistent and achieve your goals.",
      bg: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <div className="mb-10">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="rounded-3xl overflow-hidden"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={`bg-gradient-to-br ${slide.bg} text-white p-10 md:p-16 rounded-3xl`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-white/90">
                  {slide.subtitle}
                </p>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}