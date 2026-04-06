import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function PortalSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1633] to-[#2a1f5c] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tighter">Smart Academic</h1>
              <p className="text-purple-300 text-sm">Review Management System</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Choose Your Portal
          </h2>
          <p className="text-xl text-gray-400 max-w-md mx-auto">
            Select your role to access the powerful academic review platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Student Card */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/student-login")}
            className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 cursor-pointer hover:border-purple-400/50 transition-all"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>

            <h3 className="text-3xl font-semibold text-white text-center mb-3">Student Portal</h3>
            <p className="text-gray-400 text-center mb-8 leading-relaxed">
              Access your dashboard, view results, submit assignments, and track your academic progress.
            </p>

            <div className="text-center">
              <button className="px-10 py-4 bg-white text-black font-semibold rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                Login as Student
              </button>
            </div>
          </motion.div>

          {/* Faculty Card */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/faculty-login")}
            className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 cursor-pointer hover:border-purple-400/50 transition-all"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="h-10 w-10 text-white" />
            </div>

            <h3 className="text-3xl font-semibold text-white text-center mb-3">Faculty Portal</h3>
            <p className="text-gray-400 text-center mb-8 leading-relaxed">
              Manage subjects, conduct reviews, provide feedback, and monitor student performance.
            </p>

            <div className="text-center">
              <button className="px-10 py-4 bg-white text-black font-semibold rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                Login as Faculty
              </button>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          A modern platform for academic excellence
        </div>
      </div>
    </div>
  );
}