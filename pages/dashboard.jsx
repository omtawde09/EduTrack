
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Classroom } from "@/entities/Classroom";
import { Student } from "@/entities/Student";
import { Attendance } from "@/entities/Attendance"; // Added based on outline
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight, BookOpen, LogIn, Plus, Trash2 } from "lucide-react"; // Trash2 added based on outline

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load user's classrooms
      const userClassrooms = await Classroom.filter({ teacher_email: currentUser.email });
      
      // Get student counts for each classroom
      const classroomsWithCounts = await Promise.all(
        userClassrooms.map(async (classroom) => {
          const students = await Student.filter({ classroom_id: classroom.id });
          return {
            ...classroom,
            studentCount: students.length
          };
        })
      );
      
      setClassrooms(classroomsWithCounts);
    } catch (error) {
      setUser(null);
      console.error("Authentication or data loading error:", error);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleClassroomClick = (classroom) => {
    localStorage.setItem('selectedClassroom', JSON.stringify(classroom));
    navigate(createPageUrl("DateSelection"));
  };

  const handleAddClassroom = () => {
    navigate(createPageUrl("AddClassroom"));
  };

  /**
   * Handles the deletion of a classroom.
   * Prevents event propagation to avoid triggering the card's general click handler.
   * Prompts the user for confirmation before proceeding with deletion.
   * Assumes Classroom.delete handles cascading deletion of associated students and attendance.
   * Refreshes the classroom list upon successful deletion.
   * @param {Event} e - The click event.
   * @param {string} classroomId - The ID of the classroom to delete.
   */
  const handleDeleteClassroom = async (e, classroomId) => {
    e.stopPropagation(); // Prevent the parent Card's onClick from firing
    if (window.confirm("Are you sure you want to delete this classroom? All associated students and attendance records will also be deleted.")) {
      try {
        // Assuming Classroom.delete handles cascading deletion for students and attendance
        await Classroom.delete(classroomId);
        // Refresh the list of classrooms after deletion
        await checkAuthAndLoadData();
      } catch (error) {
        console.error("Error deleting classroom:", error);
        alert("Failed to delete classroom. Please try again.");
      }
    }
  };

  /**
   * Handles navigation to the student import page for a specific classroom.
   * Prevents event propagation to avoid triggering the card's general click handler.
   * Stores the selected classroom in local storage and navigates to a dedicated import page.
   * @param {Event} e - The click event.
   * @param {object} classroom - The classroom object for which students are to be imported.
   */
  const handleImportStudents = (e, classroom) => {
    e.stopPropagation(); // Prevent the parent Card's onClick from firing
    localStorage.setItem('selectedClassroom', JSON.stringify(classroom));
    // Navigate to an "Import Students" page. This page would handle the actual Excel file processing.
    // Assuming a route like "ImportStudentsPage" exists or will be created.
    navigate(createPageUrl("ImportStudentsPage", { classroomId: classroom.id })); 
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
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Student Attendance System</h1>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Please log in to access the attendance dashboard and manage your classrooms.
        </p>
        <Button
          onClick={handleLogin}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login to Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Classroom Dashboard</h1>
          <p className="text-slate-600">Welcome, {user.full_name}! Manage your classrooms and attendance</p>
        </div>
        <Button
          onClick={handleAddClassroom}
          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Classroom
        </Button>
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">No Classrooms Yet</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Get started by creating your first classroom. You can then add students and begin taking attendance.
          </p>
          <Button
            onClick={handleAddClassroom}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Classroom
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <Card 
                key={classroom.id}
                className="relative cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg group"
                onClick={() => handleClassroomClick(classroom)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    {/* Action buttons for delete and import, appearing on hover */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleImportStudents(e, classroom)}
                        title="Import Students (Excel)"
                      >
                        <Plus className="w-5 h-5" /> {/* Using Plus icon for import functionality */}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteClassroom(e, classroom.id)}
                        title="Delete Classroom"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl text-slate-800 mb-2">{classroom.name}</CardTitle>
                  <p className="text-slate-600 mb-3">{classroom.subject}</p>
                  {classroom.description && (
                    <p className="text-sm text-slate-500 mb-3">{classroom.description}</p>
                  )}
                  <div className="flex items-center text-sm text-slate-500">
                    <Users className="w-4 h-4 mr-2" />
                    {classroom.studentCount} students
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{classrooms.length}</div>
                <div className="text-sm text-slate-600">Total Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {classrooms.reduce((sum, c) => sum + c.studentCount, 0)}
                </div>
                <div className="text-sm text-slate-600">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(classrooms.map(c => c.subject)).size}
                </div>
                <div className="text-sm text-slate-600">Subjects</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
