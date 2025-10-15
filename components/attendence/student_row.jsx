import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, User } from "lucide-react";

export default function StudentRow({ student, status, onStatusChange }) {
  const getRowClasses = () => {
    if (status === 'present') return 'bg-emerald-50 border-emerald-200';
    if (status === 'absent') return 'bg-red-50 border-red-200';
    return 'bg-white border-slate-200 hover:bg-slate-50';
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${getRowClasses()}`}>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <div className="font-medium text-slate-800">{student.name}</div>
          <div className="text-sm text-slate-600">Roll: {student.roll}</div>
          <div className="text-xs text-slate-500">{student.email}</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant={status === 'present' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(student.roll, 'present')}
          className={`${
            status === 'present' 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
          } transition-all duration-200`}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Present
        </Button>
        <Button
          variant={status === 'absent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(student.roll, 'absent')}
          className={`${
            status === 'absent' 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'border-red-300 text-red-700 hover:bg-red-50'
          } transition-all duration-200`}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Absent
        </Button>
      </div>
    </div>
  );
}
