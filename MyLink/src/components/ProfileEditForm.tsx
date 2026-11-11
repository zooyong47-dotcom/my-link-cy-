"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  UpdateProfileInput,
  normalizeUsername,
  usernameFieldSchema,
} from "@/lib/validations/profile";
import { MyLinkProfile } from "@/types/mylink";
import { UsernameCheckResult } from "@/hooks/useMyLinkData";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  AtSign,
  Check,
  RotateCcw,
  SearchCheck,
} from "lucide-react";

interface ProfileEditFormProps {
  profile: MyLinkProfile;
  isProfileLoaded?: boolean;
  onCheckUsername: (username: string) => Promise<UsernameCheckResult>;
  onSaveProfile: (data: UpdateProfileInput) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  onOptimisticSubmit?: () => void;
}

type CheckState =
  | "idle"
  | "checking"
  | "available"
  | "duplicate"
  | "require_check";

export function ProfileEditForm({
  profile,
  isProfileLoaded = true,
  onCheckUsername,
  onSaveProfile,
  onCancel,
  onSuccess,
  onOptimisticSubmit,
}: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onTouched",
    defaultValues: {
      username: profile.username === "guest" ? "" : profile.username,
      bio: profile.bio || "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [checkMessage, setCheckMessage] = useState<string>("");
  const [verifiedUsernameLower, setVerifiedUsernameLower] = useState<
    string | null
  >(null);

  const initializedAfterLoadRef = useRef(false);

  // Firestore 프로필 로드 완료 시 초기값 동기화
  useEffect(() => {
    if (!isProfileLoaded) return;

    if (!initializedAfterLoadRef.current || !isDirty) {
      reset({
        username: profile.username === "guest" ? "" : profile.username,
        bio: profile.bio || "",
      });
      initializedAfterLoadRef.current = true;
    }
  }, [
    isProfileLoaded,
    profile.username,
    profile.bio,
    isDirty,
    reset,
  ]);

  const watchedUsername = watch("username") || "";
  const watchedBio = watch("bio") || "";

  const cleanUsername = normalizeUsername(watchedUsername);
  const currentUsernameLower = cleanUsername.toLowerCase();
  const savedUsernameLower = (
    profile.username === "guest" ? "" : profile.username
  ).toLowerCase();
  const isUsernameChanged = currentUsernameLower !== savedUsernameLower;

  // username 입력값이 검증 완료된 값과 달라지면 중복 확인 상태 초기화
  useEffect(() => {
    if (errors.username?.type === "manual") {
      clearErrors("username");
    }
    if (
      verifiedUsernameLower !== null &&
      currentUsernameLower !== verifiedUsernameLower
    ) {
      setCheckState("idle");
      setCheckMessage("");
      setVerifiedUsernameLower(null);
    } else if (verifiedUsernameLower === null && checkState !== "idle") {
      setCheckState("idle");
      setCheckMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUsernameLower]);

  const handleCheckDuplicate = async () => {
    clearErrors("username");

    const formatResult = usernameFieldSchema.safeParse(watchedUsername);
    if (!formatResult.success) {
      const msg =
        formatResult.error.issues[0]?.message ||
        "올바른 username 형식을 입력해 주세요.";
      setError("username", { type: "manual", message: msg });
      setCheckState("idle");
      setCheckMessage("");
      return;
    }

    setCheckState("checking");
    setCheckMessage("");
    try {
      const result = await onCheckUsername(cleanUsername);
      if (result.available) {
        setCheckState("available");
        setCheckMessage(result.message);
        setVerifiedUsernameLower(currentUsernameLower);
        clearErrors("username");
      } else {
        setCheckState("duplicate");
        setCheckMessage(result.message);
        setVerifiedUsernameLower(null);
        setError("username", { type: "manual", message: result.message });
      }
    } catch (e) {
      console.error("Username check error:", e);
      setCheckState("idle");
      setError("username", {
        type: "manual",
        message: "중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  };

  const handleResetForm = () => {
    reset({
      username: profile.username === "guest" ? "" : profile.username,
      bio: profile.bio || "",
    });
    setCheckState("idle");
    setCheckMessage("");
    setVerifiedUsernameLower(null);
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    const normalizedTarget = normalizeUsername(data.username).toLowerCase();

    // username이 기존 값에서 변경되었는데 아직 중복 확인을 거치지 않은 경우 확인 유도
    if (
      normalizedTarget !== savedUsernameLower &&
      !(checkState === "available" && verifiedUsernameLower === normalizedTarget)
    ) {
      setCheckState("require_check");
      setCheckMessage("변경된 username의 중복 확인을 먼저 진행해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const savedValues = {
        username: normalizeUsername(data.username),
        bio: data.bio.trim(),
      };

      const savePromise = onSaveProfile(savedValues);
      if (onOptimisticSubmit) {
        savePromise.catch(() => {});
        onOptimisticSubmit();
        return;
      }

      await savePromise;

      reset(savedValues);
      setVerifiedUsernameLower(normalizedTarget);
      setCheckState("available");
      setCheckMessage("현재 사용 중인 내 username입니다.");
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("username") || msg.includes("사용 중")) {
        setCheckState("duplicate");
        setCheckMessage(msg);
        setError("username", { type: "manual", message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isProfileLoaded) {
    return (
      <div className="space-y-4 animate-pulse py-2">
        <div className="h-11 rounded-[12px] bg-neutral-weak2/70" />
        <div className="h-11 rounded-[12px] bg-neutral-weak2/70" />
        <div className="h-24 rounded-[12px] bg-neutral-weak2/70" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* 1. username 입력 + 중복 확인 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="profile-username"
            className="text-xs font-bold text-neutral-main flex items-center gap-1 cursor-pointer"
          >
            <span>username</span>
            <span className="text-accent-main">*</span>
          </label>
          <span
            className={`text-[11px] font-mono ${
              cleanUsername.length > 24
                ? "text-accent-main font-bold"
                : "text-neutral-medium"
            }`}
          >
            {cleanUsername.length}/24
          </span>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="relative flex-1 min-w-0">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-medium">
              <AtSign className="w-3.5 h-3.5" />
            </span>
            <input
              id="profile-username"
              type="text"
              maxLength={28}
              autoComplete="off"
              spellCheck={false}
              {...register("username")}
              placeholder="영문, 숫자, 밑줄(_), 마침표(.)"
              aria-invalid={
                !!errors.username ||
                checkState === "duplicate" ||
                checkState === "require_check"
              }
              className={`w-full pl-8 pr-3.5 py-2.5 rounded-[12px] border font-mono text-xs sm:text-sm text-neutral-main placeholder:font-sans placeholder:text-neutral-weak4 focus:outline-none transition-all ${
                errors.username ||
                checkState === "duplicate" ||
                checkState === "require_check"
                  ? "border-accent-main bg-accent-weak/20 focus:ring-2 focus:ring-accent-main/20"
                  : checkState === "available"
                  ? "border-[#008161] bg-static-white focus:ring-2 focus:ring-[#008161]/15"
                  : "border-neutral-weak2 bg-neutral-weak/40 focus:border-primary-main focus:bg-static-white focus:ring-2 focus:ring-primary-main/10"
              }`}
            />
          </div>

          <Button
            type="button"
            variant={checkState === "available" ? "outline" : "secondary"}
            onClick={handleCheckDuplicate}
            disabled={
              checkState === "checking" ||
              isSubmitting ||
              cleanUsername.length === 0
            }
            className={`h-[42px] px-3.5 rounded-[12px] text-xs font-bold shrink-0 gap-1.5 ${
              checkState === "available"
                ? "border-[#008161]/40 text-[#008161] hover:bg-[#008161]/5"
                : ""
            }`}
          >
            {checkState === "checking" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>확인 중</span>
              </>
            ) : checkState === "available" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>확인됨</span>
              </>
            ) : (
              <>
                <SearchCheck className="w-3.5 h-3.5" />
                <span>중복 확인</span>
              </>
            )}
          </Button>
        </div>

        {/* username 상태 피드백 */}
        {errors.username ? (
          <p className="text-xs text-accent-main flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.username.message}</span>
          </p>
        ) : checkState === "require_check" ? (
          <p className="text-xs text-accent-main flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{checkMessage}</span>
          </p>
        ) : checkState === "available" ? (
          <p className="text-xs text-[#008161] flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{checkMessage}</span>
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-neutral-medium">
            <span>
              내 프로필 주소:{" "}
              <strong className="font-mono text-neutral-strong1 font-semibold">
                mylink.com/{cleanUsername || "username"}
              </strong>
            </span>
            {isUsernameChanged && cleanUsername.length >= 2 && (
              <span className="text-primary-main font-semibold">
                저장 전 중복 확인이 필요합니다
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. 소개글 (bio) 입력 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="profile-bio"
            className="text-xs font-bold text-neutral-main cursor-pointer"
          >
            소개글
          </label>
          <span
            className={`text-[11px] font-mono ${
              watchedBio.trim().length > 160
                ? "text-accent-main font-bold"
                : "text-neutral-medium"
            }`}
          >
            {watchedBio.trim().length}/160
          </span>
        </div>

        <textarea
          id="profile-bio"
          rows={3}
          maxLength={180}
          {...register("bio")}
          placeholder="나를 소개하는 문구를 입력해 주세요 (줄바꿈 가능)"
          aria-invalid={!!errors.bio}
          className={`w-full px-3.5 py-2.5 rounded-[12px] border text-sm text-neutral-main placeholder:text-neutral-weak4 focus:outline-none resize-none leading-relaxed transition-all ${
            errors.bio
              ? "border-accent-main bg-accent-weak/20 focus:ring-2 focus:ring-accent-main/20"
              : "border-neutral-weak2 bg-neutral-weak/40 focus:border-primary-main focus:bg-static-white focus:ring-2 focus:ring-primary-main/10"
          }`}
        />

        {errors.bio ? (
          <p className="text-xs text-accent-main flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.bio.message}</span>
          </p>
        ) : (
          <p className="text-[11px] text-neutral-medium">
            방문자 프로필 화면 상단에 표시되는 소개 문구입니다.
          </p>
        )}
      </div>

      {/* 하단 액션 영역 */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-neutral-weak1">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            취소
          </Button>
        ) : (
          isDirty && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleResetForm}
              className="w-full sm:w-auto gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>되돌리기</span>
            </Button>
          )
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full sm:w-auto shadow-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>저장 중...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>프로필 저장</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
