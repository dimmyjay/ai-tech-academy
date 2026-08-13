"use client";

import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({ 
  size = 40, 
  color = "text-orange-600", 
  message,
  fullScreen = false 
}: LoaderProps) {
  
  const Content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 
        className={`animate-spin ${color}`} 
        size={size} 
      />
      {message && (
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {Content}
      </div>
    );
  }

  return Content;
}