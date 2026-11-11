"use client";

import React from "react";
import Link from "next/link";
import { Share2, Copy, Send, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";
import { getDisplayName } from "@/lib/utils";

interface WindowHeaderProps {
  user?: User | null;
  username?: string;
  onShare: () => void;
  onOpenPreview?: () => void;
  linkToPersonalPage?: boolean;
}

export function WindowHeader({
  user,
  username,
  onShare,
  onOpenPreview,
  linkToPersonalPage = false,
}: WindowHeaderProps) {
  const handle =
    username && username !== "guest"
      ? username
      : user
      ? getDisplayName(user)
      : "guest";

  const canNavigatePersonal = linkToPersonalPage && handle !== "guest";

  return (
    <div className="bg-static-white border-b border-neutral-weak2 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
      {canNavigatePersonal ? (
        <Link
          href={`/${encodeURIComponent(handle)}`}
          prefetch={false}
          className="inline-flex items-center gap-1 font-mono text-xs text-neutral-medium hover:text-primary-main transition-colors truncate"
          title="내 개인 페이지로 이동"
        >
          <span className="truncate">mylink.com/{handle}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </Link>
      ) : (
        <span className="font-mono text-xs text-neutral-medium truncate">
          mylink.com/{handle}
        </span>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {onOpenPreview && (
          <Button
            onClick={onOpenPreview}
            variant="ghost"
            size="sm"
            title="방문자 화면 미리보기"
            className="rounded-full text-xs font-medium px-2.5 h-7 text-neutral-strong1 hover:text-primary-main gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>미리보기</span>
          </Button>
        )}

        <Button
          onClick={onShare}
          variant="ghost"
          size="sm"
          title="프로필 공유하기"
          className="rounded-full text-xs font-medium px-2.5 h-7 text-neutral-strong1 hover:text-primary-main gap-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>공유</span>
        </Button>
      </div>
    </div>
  );
}

export function BottomActions({
  onCopyAll,
  email,
}: {
  onCopyAll: () => void;
  email?: string;
}) {
  return (
    <div className="mt-7 pt-6 border-t border-neutral-weak1 flex flex-col sm:flex-row gap-2.5">
      <Button
        onClick={onCopyAll}
        variant="primary"
        size="default"
        className="flex-1 rounded-[14px] h-11 text-sm font-bold"
      >
        <Copy className="w-4 h-4" />
        <span>프로필 링크 복사</span>
      </Button>

      {email && (
        <Button
          variant="secondary"
          size="default"
          className="flex-1 rounded-[14px] h-11 text-sm font-bold"
          render={<a href={`mailto:${email}`} />}
        >
          <Send className="w-4 h-4" />
          <span>메일 문의</span>
        </Button>
      )}
    </div>
  );
}
