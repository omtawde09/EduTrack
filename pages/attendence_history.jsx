
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Classroom } from "@/entities/Classroom";
import { Attendance } from "@/entities/Attendance";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Download, Calendar, Users, FileText, LogIn } from "lucide-react";
import { format } from "date-fns";

export default function AttendanceHistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndData();
  }, []);

  const checkAuthAndData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load user's classrooms
      const userClassrooms = await Classroom.filter({ teacher_email: currentUser.email });
      setClassrooms(userClassrooms);
      
      // Load attendance records
      const records = await Attendance.filter({ teacher_email: currentUser.email }, '-date');
      setAttendanceRecords(records);
      setFilteredRecords(records);
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl("AttendanceHistory"));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    if (selectedClassroom === "" || selectedClassroom === "all") {
      setFilteredRecords(attendanceRecords);
    } else {
      setFilteredRecords(attendanceRecords.filter(record => record.classroom === selectedClassroom));
    }
  }, [selectedClassroom, attendanceRecords]);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No data to export");
      return;
    }

    const csvData = [];
    const headers = ["Date", "Classroom", "Student Name", "Roll Number", "Email", "Status"];
    csvData.push(headers.join(","));

    filteredRecords.forEach(record => {
      const classroom = classrooms.find(c => c.id === record.classroom);
      const classroomName = classroom ? classroom.name : 'Unknown Classroom';
      
      const row = [
        format(new Date(record.date), 'yyyy-MM-dd'),
        classroomName,
        record.student_name,
        record.student_roll,
        record.student_email || '',
        record.status
      ];
      csvData.push(row.map(field => `"${field}"`).join(","));
    });

    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_history_${selectedClassroom || 'all'}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupRecordsByDateTimeAndClassroom = () => {
    const grouped = {};
    filteredRecords.forEach(record => {
      const key = `${record.date}_${record.time}_${record.classroom}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: record.date,
          time: record.time,
          classroom_id: record.classroom,
          classroom: classrooms.find(c => c.id === record.classroom),
          students: []
        };
      }
      grouped[key].students.push(record);
    });
    return Object.values(grouped).sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      // If dates are the same, compare by time
      return b.time.localeCompare(a.time);
    });
  };

  const getAttendanceStats = (students) => {
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    return { present, absent, total: students.length };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <History className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Attendance History</h1>
        <p className="text-slate-600 mb-8">Please log in to view attendance records.</p>
        <Button
          onClick={handleLogin}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login to Continue
        </Button>
      </div>
    );
  }

  const groupedRecords = groupRecordsByDateTimeAndClassroom();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Attendance History</h1>
        <p className="text-slate-600">View and export past attendance records</p>
      </div>

      {/* Filters and Export */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Filter & Export
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Classroom</label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Classrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name} - {classroom.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={exportToCSV}
              disabled={filteredRecords.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{groupedRecords.length}</div>
              <div className="text-sm text-blue-700">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {filteredRecords.filter(r => r.status === 'present').length}
              </div>
              <div className="text-sm text-emerald-700">Total Present</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredRecords.filter(r => r.status === 'absent').length}
              </div>
              <div className="text-sm text-red-700">Total Absent</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Records */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Attendance Records ({groupedRecords.length} sessions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groupedRecords.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No attendance records found</p>
              <p className="text-sm text-slate-400">Start marking attendance to see records here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedRecords.map((group, index) => {
                const stats = getAttendanceStats(group.students);
                return (
                  <Card key={index} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg">
                            {group.classroom ? group.classroom.name : 'Unknown Classroom'}
                          </h3>
                          <p className="text-slate-600">
                            {group.classroom ? group.classroom.subject : 'Unknown Subject'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(group.date), 'EEEE, MMMM d, yyyy')} at {group.time}
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-2 md:mt-0">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <Users className="w-3 h-3 mr-1" />
                            {stats.present} Present
                          </Badge>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <Users className="w-3 h-3 mr-1" />
                            {stats.absent} Absent
                          </Badge>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Roll No</TableHead>
                              <TableHead>Student Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.students.map((student, studentIndex) => (
                              <TableRow key={studentIndex}>
                                <TableCell className="font-medium">{student.student_roll}</TableCell>
                                <TableCell>{student.student_name}</TableCell>
                                <TableCell className="text-slate-600">{student.student_email || '-'}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      student.status === 'present'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    }
                                  >
                                    {student.status === 'present' ? 'Present' : 'Absent'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
