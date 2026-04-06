import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarWidget() {
  const [date, setDate] = useState(new Date());
  
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  
  const today = new Date();
  
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));

  return (
    <div className="bg-white dark:bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-gray-200 dark:border-white/20 shadow-sm">
      <div className="flex justify-between items-center mb-4 text-gray-900 dark:text-white">
        <h3 className="font-semibold text-lg">{monthNames[date.getMonth()]} {date.getFullYear()}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="pb-2">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-sm">
        {blanks.map(b => <div key={`blank-${b}`} className="p-1"></div>)}
        {days.map(d => {
          const isToday = d === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
          return (
            <div key={d} className="p-1 flex justify-center">
              <button 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isToday 
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30' 
                    : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 cursor-pointer'
                }`}
              >
                {d}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
