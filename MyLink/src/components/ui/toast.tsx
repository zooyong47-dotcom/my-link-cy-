"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string | null;
  type?: "success" | "error";
  onClose?: () => void;
}

export function Toast({ message, type = "success" }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-[16px] font-semibold text-sm shadow-nol-2 flex items-center gap-2.5 transition-all duration-200 animate-in fade-in slide-in-from-top-4",
        type === "success"
          ? "bg-neutral-main text-static-white"
          : "bg-accent-main text-static-white"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-4 h-4 text-primary-weak1 stroke-[2.5]" />
      ) : (
        <AlertCircle className="w-4 h-4 text-static-white stroke-[2.5]" />
      )}
      <span>{message}</span>
    </div>
  );
}
