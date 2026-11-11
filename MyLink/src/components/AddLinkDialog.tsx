"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLinkSchema,
  CreateLinkInput,
} from "@/lib/validations/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Link2,
} from "lucide-react";

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLink: (link: {
    title: string;
    url: string;
    subtitle?: string;
    badge?: string;
    icon?: string;
    highlight?: boolean;
  }) => Promise<any> | void;
}

export function AddLinkDialog({
  open,
  onOpenChange,
  onAddLink,
}: AddLinkDialogProps) {
  // ⚡ React Hook Form + Zod Resolver 연동
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setFocus,
    formState: { errors, touchedFields, isSubmitted, isValid },
  } = useForm<CreateLinkInput>({
    resolver: zodResolver(createLinkSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const currentTitle = watch("title") || "";
  const currentUrl = watch("url") || "";

  // 다이얼로그가 열릴 때 제목 필드로 자동 포커스
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setFocus("title");
      }, 100);
    }
  }, [open, setFocus]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onOpenChange(false);
  };

  // 폼 제출 완료 핸들러 (Firestore 비동기 저장 연동)
  const onSubmit = async (data: CreateLinkInput) => {
    let finalUrl = data.url.trim();
    if (
      !finalUrl.startsWith("http://") &&
      !finalUrl.startsWith("https://") &&
      !finalUrl.startsWith("mailto:")
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      setIsSubmitting(true);
      await onAddLink({
        title: data.title.trim(),
        url: finalUrl,
        icon: "globe",
        highlight: false,
      });

      handleClose();
    } catch (error) {
      console.error("Firestore link creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTitleValid = !errors.title && currentTitle.trim().length >= 2;
  const isUrlValid = !errors.url && currentUrl.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[10px] bg-primary-weak text-primary-main">
              <Sparkles className="w-4 h-4" />
            </span>
            <DialogTitle>새 링크 추가</DialogTitle>
          </div>
          <DialogDescription>
            링크의 제목과 URL을 입력하여 파이어베이스에 추가하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* 전체 에러 요약 알림 */}
          {isSubmitted && !isValid && Object.keys(errors).length > 0 && (
            <div className="p-3 rounded-[12px] bg-accent-weak border border-accent-main/20 text-accent-main text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-accent-main" />
              <span>입력 정보 중 확인이 필요한 항목이 있습니다. 아래 내용을 확인해 주세요.</span>
            </div>
          )}

          {/* 제목 입력 필드 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="link-title"
                className="text-xs font-bold text-neutral-main flex items-center gap-1 cursor-pointer"
              >
                <span>제목</span>
                <span className="text-accent-main">*</span>
              </label>
              <div className="flex items-center gap-2">
                {touchedFields.title && isTitleValid && (
                  <span className="text-[11px] font-medium text-[#008161] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 사용 가능
                  </span>
                )}
                <span
                  className={`text-[11px] font-mono ${
                    currentTitle.length > 40
                      ? "text-accent-main font-bold"
                      : "text-neutral-medium"
                  }`}
                >
                  {currentTitle.length}/40
                </span>
              </div>
            </div>
            <div className="relative">
              <input
                id="link-title"
                type="text"
                maxLength={45}
                {...register("title")}
                placeholder="예: 포트폴리오 웹사이트, GitHub 저장소"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
                className={`w-full px-3.5 py-2.5 rounded-[12px] border text-sm text-neutral-main placeholder:text-neutral-weak4 focus:outline-none transition-all ${
                  errors.title
                    ? "border-accent-main bg-accent-weak/20 focus:ring-2 focus:ring-accent-main/20"
                    : isTitleValid
                    ? "border-neutral-weak2 bg-static-white focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                    : "border-neutral-weak2 bg-neutral-weak/40 focus:border-primary-main focus:bg-static-white focus:ring-2 focus:ring-primary-main/10"
                }`}
              />
            </div>
            {errors.title && (
              <p
                id="title-error"
                className="text-xs text-accent-main flex items-center gap-1 mt-1 font-medium animate-in fade-in duration-150"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title.message}</span>
              </p>
            )}
          </div>

          {/* URL 입력 필드 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="link-url"
                className="text-xs font-bold text-neutral-main flex items-center gap-1 cursor-pointer"
              >
                <span>URL</span>
                <span className="text-accent-main">*</span>
              </label>
              {touchedFields.url && isUrlValid && (
                <span className="text-[11px] font-medium text-[#008161] flex items-center gap-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 유효한 주소
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="link-url"
                type="text"
                {...register("url")}
                placeholder="예: https://myportfolio.com 또는 github.com/user"
                aria-invalid={!!errors.url}
                aria-describedby={errors.url ? "url-error" : undefined}
                className={`w-full px-3.5 py-2.5 rounded-[12px] border text-sm text-neutral-main placeholder:text-neutral-weak4 focus:outline-none font-mono text-xs sm:text-sm transition-all ${
                  errors.url
                    ? "border-accent-main bg-accent-weak/20 focus:ring-2 focus:ring-accent-main/20"
                    : isUrlValid
                    ? "border-neutral-weak2 bg-static-white focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                    : "border-neutral-weak2 bg-neutral-weak/40 focus:border-primary-main focus:bg-static-white focus:ring-2 focus:ring-primary-main/10"
                }`}
              />
            </div>
            {errors.url ? (
              <p
                id="url-error"
                className="text-xs text-accent-main flex items-center gap-1 mt-1 font-medium animate-in fade-in duration-150"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.url.message}</span>
              </p>
            ) : (
              <p className="text-[11px] text-neutral-medium">
                💡 http:// 또는 https:// 가 누락된 경우 자동으로 https:// 가 적용됩니다.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full sm:w-auto shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>파이어베이스 저장 중...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-4 h-4" />
                  <span>링크 추가하기</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
