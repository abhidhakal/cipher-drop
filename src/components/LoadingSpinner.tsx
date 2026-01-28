"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizes = {
    sm: { icon: 20, container: "h-12 w-12" },
    md: { icon: 32, container: "h-16 w-16" },
    lg: { icon: 48, container: "h-24 w-24" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className={`relative ${sizes[size].container}`}>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield size={sizes[size].icon * 0.5} className="text-primary" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </motion.div>
  );
}
