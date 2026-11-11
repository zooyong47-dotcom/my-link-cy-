"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2, Link as LinkIcon } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkTitle: string;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  linkTitle,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const handleClose = () => {
    if (isDeleting) return;
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Delete confirmation failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-[12px] bg-accent-weak text-accent-main">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-main">
              정말 삭제하시겠습니까?
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* 링크 이름 표시 영역 */}
          <div className="bg-neutral-weak border border-neutral-weak2 rounded-[14px] p-3.5 flex items-start gap-2.5">
            <LinkIcon className="w-4 h-4 text-primary-main shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-neutral-medium block mb-0.5">
                삭제 대상 링크
              </span>
              <p className="text-sm font-bold text-neutral-main break-all line-clamp-2">
                {linkTitle || "제목 없음"}
              </p>
            </div>
          </div>

          {/* 경고 메시지 (빨간색) */}
          <div className="flex items-center gap-2 px-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-main shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-accent-main">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={handleClose}
            className="w-full sm:w-auto h-10 px-4 rounded-[12px] text-xs sm:text-sm font-semibold"
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="w-full sm:w-auto h-10 px-4 rounded-[12px] text-xs sm:text-sm font-bold bg-accent-main hover:bg-[#c7000d] text-static-white shadow-sm transition-all"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>삭제하는 중...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                <span>삭제하기</span>
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
