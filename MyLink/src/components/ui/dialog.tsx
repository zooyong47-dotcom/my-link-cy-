"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
    >
      {children}
    </BaseDialog.Root>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <BaseDialog.Portal>
      {/* 백드롭 오버레이 (NOL scrim / blur) */}
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-neutral-main/50 backdrop-blur-sm transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />

      {/* 뷰포트 중앙 정렬 컨테이너 */}
      <BaseDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <BaseDialog.Popup
          className={cn(
            "relative w-full max-w-lg rounded-[20px] sm:rounded-[24px] bg-static-white p-5 sm:p-7 shadow-2xl border border-neutral-weak2 outline-none transition-[transform,opacity] duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 max-h-[90vh] overflow-y-auto",
            className
          )}
        >
          <BaseDialog.Close
            className="absolute right-4 top-4 sm:right-5 sm:top-5 rounded-[10px] p-1.5 text-neutral-medium hover:text-neutral-main hover:bg-neutral-weak1 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </BaseDialog.Close>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left mb-5 pr-6", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <BaseDialog.Title
      className={cn(
        "text-lg sm:text-xl font-bold tracking-tight text-neutral-main",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <BaseDialog.Description
      className={cn("text-xs sm:text-sm text-neutral-strong1", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 mt-6 pt-4 border-t border-neutral-weak1",
        className
      )}
      {...props}
    />
  );
}
