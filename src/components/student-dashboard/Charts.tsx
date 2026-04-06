import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface ChartsProps {
  marksData?: any[];
  progressData?: any[];
}

const FALLBACK_MARKS = [
  { subject: "DSA", marks: 80 },
  { subject: "DBMS", marks: 75 },
  { subject: "ML", marks: 85 }
];

const FALLBACK_PROGRESS = [
  { month: "Jan", marks: 70 },
  { month: "Feb", marks: 75 },
  { month: "Mar", marks: 80 }
];

export function Charts({ marksData = [], progressData = [] }: ChartsProps) {
  const displayMarks = marksData.length > 0 ? marksData : FALLBACK_MARKS;
  const displayProgress = progressData.length > 0 ? progressData : FALLBACK_PROGRESS;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Overview</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Analytics based on evaluations</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Bar Chart */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-2xl p-5 hover:shadow-lg transition duration-300">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-6 flex items-center justify-between">
            <span>Subject Marks</span>
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-md">Last 6 Subjects</span>
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayMarks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(139, 92, 246, 0.05)'}} 
                  contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#4b5563' }}
                />
                <Bar dataKey="marks" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-2xl p-5 hover:shadow-lg transition duration-300">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-6 flex items-center justify-between">
            <span>Progress Trend</span>
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-md">Year to Date</span>
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#4b5563' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="marks" 
                  stroke="#ec4899" 
                  strokeWidth={3} 
                  dot={{ fill: '#ec4899', r: 4, strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
