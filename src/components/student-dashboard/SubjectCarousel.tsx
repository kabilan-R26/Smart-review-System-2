import { Link } from "react-router-dom";
import { SubjectIcon } from "@/components/SubjectIcon";

interface SubjectCarouselProps {
  subjects: any[];
  reviews: any[];
}

export function SubjectCarousel({ subjects, reviews }: SubjectCarouselProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Active Subjects</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review your latest academic activities</p>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {subjects.map(subject => {
          const review = reviews.find(r => r.subjectId === subject.id);
          const status = review?.status || "not_submitted";
          let badgeLabel = "Not Reviewed";
          if (status === "completed") badgeLabel = "Completed";
          if (status === "review_submitted") badgeLabel = "In Progress";
          
          return (
            <Link 
              to={`/student/subject/${subject.id}`} 
              key={subject.id}
              className="min-w-[300px] flex-shrink-0 bg-white dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-2xl p-6 hover:shadow-xl transition duration-300 group flex flex-col"
            >
              <div className="mb-6">
                <SubjectIcon subjectName={subject.name} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors line-clamp-1 mb-2">{subject.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                Track and manage your {subject.isLSM ? "Cabin" : "Presentation"} tasks for this subject.
              </p>
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/10 pt-4 mt-auto">
                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                   {badgeLabel}
                 </span>
                 {review?.marks && (
                    <span className="font-bold text-gray-900 dark:text-white">
                      {review.marks}<span className="text-sm text-gray-500 font-normal">/100</span>
                    </span>
                 )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
