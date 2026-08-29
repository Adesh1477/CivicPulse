import React from "react";

export default function AppLoadingScreen({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <div className="text-sm font-bold tracking-[0.2em] text-slate-600 uppercase">Loading CivicPulse</div>
      </div>
    </div>
  );
}
