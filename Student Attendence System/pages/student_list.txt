
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Student } from "@/entities/Student";
import { Attendance } from "@/entities/Attendance";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, CheckCircle, XCircle, Save, AlertCircle, LogIn, Plus } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

import StudentRow from "../components/attendance/StudentRow";

export default function StudentListPage() {
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthAndData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const selectedClassroom = localStorage.getItem('selectedClassroom');
      const selectedDate = localStorage.getItem('selectedDate');
      const selectedTime = localStorage.getItem('selectedTime');
      
      if (!selectedClassroom || !selectedDate || !selectedTime) {
        navigate(createPageUrl("Dashboard"));
        return;
      }

      const classroomData = JSON.parse(selectedClassroom);
      setClassroom(classroomData);
      setSelectedDate(selectedDate);
      setSelectedTime(selectedTime);

      // Load students for this classroom
      const studentList = await Student.filter({ classroom_id: classroomData.id });
      if (studentList.length === 0) {
        setError("No students found in this classroom. Please add students first.");
      }
      setStudents(studentList);

      // Check if attendance already exists for this date and time
      const existingAttendance = await Attendance.filter({
        classroom: classroomData.id,
        date: selectedDate
      });

      const timeExists = existingAttendance.some(record => record.time === selectedTime);
      if (timeExists) {
        setError(`Attendance for ${classroomData.name} on ${format(new Date(selectedDate), 'MMMM d, yyyy')} at ${selectedTime} has already been submitted.`);
      }
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    checkAuthAndData();
  }, [checkAuthAndData]);

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.origin + window.location.pathname + window.location.search);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmitAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      setError("Please mark attendance for at least one student.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create attendance records
      const attendanceRecords = [];
      for (const student of students) {
        const status = attendance[student.id];
        if (status) {
          attendanceRecords.push({
            teacher_email: user.email,
            classroom: classroom.id,
            date: selectedDate,
            time: selectedTime,
            student_roll: student.roll_number,
            student_name: student.name,
            student_email: student.email || '',
            status: status
          });
        }
      }

      // Bulk create attendance records
      await Attendance.bulkCreate(attendanceRecords);

      setSuccess("Attendance submitted successfully!");
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);

    } catch (error) {
      setError("Failed to submit attendance. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  const goBack = () => {
    navigate(createPageUrl("DateSelection"));
  };

  const handleAddStudents = () => {
    navigate(createPageUrl("ManageStudents"));
  };

  const getStats = () => {
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const notMarked = students.length - present - absent;
    
    return { present, absent, notMarked };
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
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Authentication Required</h1>
        <p className="text-slate-600 mb-8">Please log in to continue with attendance marking.</p>
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

  if (!classroom || !selectedDate || !selectedTime) return null;

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={goBack}
          className="flex items-center text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Date Selection
        </Button>
        {students.length === 0 && (
          <Button
            onClick={handleAddStudents}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Students
          </Button>
        )}
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Mark Attendance</h1>
        <div className="space-y-1">
          <p className="text-lg text-slate-700">{classroom.name}</p>
          <p className="text-slate-600">
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')} at {selectedTime}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-700">{students.length}</div>
            <div className="text-sm text-slate-600">Total Students</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.present}</div>
            <div className="text-sm text-emerald-700">Present</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-red-700">Absent</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.notMarked}</div>
            <div className="text-sm text-amber-700">Not Marked</div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Student List ({students.length})
            </span>
            {students.length > 0 && (
              <Button
                variant="outline"
                onClick={handleAddStudents}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More Students
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No students in this classroom</p>
              <p className="text-sm text-slate-400 mb-4">Add students to start taking attendance</p>
              <Button
                onClick={handleAddStudents}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Students Now
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={{
                      ...student,
                      roll: student.roll_number
                    }}
                    status={attendance[student.id]}
                    onStatusChange={(_, status) => handleAttendanceChange(student.id, status)}
                  />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button
                  onClick={handleSubmitAttendance}
                  disabled={isSubmitting || Object.keys(attendance).length === 0}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium shadow-lg transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Attendance ({Object.keys(attendance).length} marked)
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
