import { motion } from "framer-motion";
import { getSubjectVisualConfig } from "@/lib/subject-meta";

interface SubjectIconProps {
  subjectName: string;
  className?: string;
}

export function SubjectIcon({ subjectName, className = "" }: SubjectIconProps) {
  const { icon: IconComponent, gradientClass, glowClass } = getSubjectVisualConfig(subjectName);

  return (
    <div className={`relative group/icon ${className}`}>
      <motion.div 
        className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 group-hover/icon:blur-2xl group-hover/icon:scale-110 ${glowClass}`}
      />
      
      <motion.div 
        whileHover={{ scale: 1.05, y: -2 }}
        className={`relative z-10 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[22px] border border-white/20 bg-gradient-to-br ${gradientClass} shadow-xl transition-transform duration-300`}
      >
        <div
          className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/icon:opacity-100"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 80%)" }}
        />
        
        <motion.div
          className="relative z-20"
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <IconComponent className="w-8 h-8 text-white drop-shadow-md" />
        </motion.div>
      </motion.div>
    </div>
  );
}
