"use client";

import React from "react";
import Image from "next/image";
import { MyLinkProfile } from "@/types/mylink";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, Pencil } from "lucide-react";

interface ProfileHeaderProps {
  profile: MyLinkProfile;
  onCopyEmail?: (email: string) => void;
  onEditProfile?: () => void;
  isLoggedIn?: boolean;
}

export function ProfileHeader({
  profile,
  onCopyEmail,
  onEditProfile,
  isLoggedIn = false,
}: ProfileHeaderProps) {
  const emailToUse = profile.email || "";

  return (
    <div className="flex flex-col items-center text-center">
      {/* 프로필 아바타 */}
      <div className="w-24 h-24 rounded-[24px] border border-neutral-weak2 bg-static-white p-1 shadow-sm overflow-hidden mb-3.5">
        <Image
          src={profile.avatarUrl || "/avatar.svg"}
          alt={profile.displayName || "프로필"}
          width={96}
          height={96}
          unoptimized
          className="w-full h-full object-cover rounded-[20px]"
        />
      </div>

      {/* 이름 및 아이디 */}
      <div className="flex items-center justify-center gap-1.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-main">
          {profile.displayName}
        </h1>
        {isLoggedIn && (
          <CheckCircle2
            className="w-4 h-4 text-primary-main shrink-0"
            aria-label="인증된 계정"
          />
        )}
      </div>

      <span className="font-mono text-xs text-neutral-medium mt-0.5">
        @{profile.username}
      </span>

      {/* 소개글 */}
      {profile.bio && (
        <p className="max-w-sm text-xs sm:text-sm text-neutral-strong1 leading-relaxed whitespace-pre-line mt-3 px-2">
          {profile.bio}
        </p>
      )}

      {/* 이메일 칩 & 프로필 수정 버튼 */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {emailToUse && onCopyEmail && (
          <button
            type="button"
            onClick={() => onCopyEmail(emailToUse)}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-weak hover:bg-primary-weak border border-neutral-weak2 hover:border-primary-weak2 px-3 py-1 text-xs text-neutral-strong1 hover:text-primary-main transition-colors cursor-pointer"
            title="이메일 복사"
          >
            <Mail className="w-3 h-3 text-neutral-medium" />
            <span className="max-w-[200px] truncate">{emailToUse}</span>
          </button>
        )}

        {isLoggedIn && onEditProfile && (
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-1 rounded-full bg-primary-weak hover:bg-primary-weak1 border border-primary-weak2 px-3 py-1 text-xs font-semibold text-primary-main transition-colors cursor-pointer"
            title="프로필 수정"
          >
            <Pencil className="w-3 h-3" />
            <span>프로필 수정</span>
          </button>
        )}
      </div>

      {!isLoggedIn && profile.badge && (
        <Badge variant="neutral" className="mt-3 text-[11px]">
          {profile.badge}
        </Badge>
      )}
    </div>
  );
}
