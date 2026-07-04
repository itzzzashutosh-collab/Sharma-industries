import React from "react";
import { Lock } from "lucide-react";

export default function CADashboardPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Lock className="text-emerald-500 w-8 h-8" />
            CA Compliance Command Center
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm max-w-2xl leading-relaxed">
            Welcome to the new CA portal. This secure terminal is designed exclusively for auditing, reporting, and compiling GST returns. Please provide instructions on which modules to build first.
          </p>
        </div>
      </div>
    </div>
  );
}
