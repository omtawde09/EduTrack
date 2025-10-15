import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { GraduationCap, LayoutDashboard, History, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/entities/User";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to={createPageUrl("Dashboard")} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800">AttendanceTracker</span>
              </Link>
              
              <div className="hidden md:flex space-x-1">
                <Link 
                  to={createPageUrl("Dashboard")} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === "Dashboard" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 inline mr-2" />
                  Dashboard
                </Link>
                <Link 
                  to={createPageUrl("AttendanceHistory")} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === "AttendanceHistory" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <History className="w-4 h-4 inline mr-2" />
                  History
                </Link>
                <Link 
                  to={createPageUrl("AddClassroom")} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === "AddClassroom" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Classroom
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
