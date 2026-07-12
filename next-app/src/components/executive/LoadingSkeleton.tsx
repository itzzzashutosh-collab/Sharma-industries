"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-6 bg-muted/65 rounded-lg w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <div className="h-4 bg-muted/65 rounded w-1/2" />
            <div className="h-8 bg-muted/65 rounded w-3/4" />
            <div className="h-3 bg-muted/65 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border space-y-3 animate-pulse">
      <div className="h-4 bg-muted/65 rounded w-1/3" />
      <div className="h-8 bg-muted/65 rounded w-1/2" />
      <div className="h-3 bg-muted/65 rounded w-2/3" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3 w-full animate-pulse">
      <div className="h-6 bg-muted/65 rounded-lg w-full" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-8 bg-muted/50 rounded-lg w-full" />
      ))}
    </div>
  );
}
