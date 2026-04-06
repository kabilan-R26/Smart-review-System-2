import { useState } from "react";
import { useAuth, getStudents, getReviews } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/UserAvatar";

export default function StudentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  if (!user) return null;

  const allStudents = getStudents();
  const reviews = getReviews().filter(r => r.facultyId === user.id);

  const filtered = search
    ? allStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.regNo?.toLowerCase().includes(search.toLowerCase()))
    : allStudents;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Students</h1>
        <p className="text-gray-400 text-sm mt-1">{allStudents.length} students enrolled</p>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
          className="pl-10 rounded-xl h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card-elevated overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/5 border-white/10">
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Reg No</TableHead>
                  <TableHead className="text-gray-400">Department</TableHead>
                  <TableHead className="text-gray-400">Attendance</TableHead>
                  <TableHead className="text-gray-400">Reviews</TableHead>
                  <TableHead className="text-gray-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(student => {
                  const studentReviews = reviews.filter(r => r.studentId === student.id && r.status === "completed").length;
                  return (
                      <TableRow key={student.id} className="zebra-row hover:bg-white/5 transition-all cursor-pointer border-white/5"
                      onClick={() => navigate(`/student/${student.id}`)}>
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={student} className="h-10 w-10" fallbackClassName="text-xs" />
                          <div>
                            <p className="font-medium text-white">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400">{student.regNo}</TableCell>
                      <TableCell className="text-sm text-gray-300">{student.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                            <div className="h-full rounded-full gradient-primary" style={{ width: `${student.attendance || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{student.attendance || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-purple-300">{studentReviews}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg text-purple-400 hover:text-white hover:bg-purple-500/20"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/student/${student.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
