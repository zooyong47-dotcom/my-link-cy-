"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SocialIconsBar } from "@/components/SocialIconsBar";
import { LinkCard } from "@/components/LinkCard";
import { CustomLink, MyLinkProfile } from "@/types/mylink";
import {
  Eye,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Share2,
  Sparkles,
  Mail,
} from "lucide-react";

interface PreviewShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MyLinkProfile;
  links: CustomLink[];
  isLoggedIn: boolean;
  onShare: () => void;
  onCopyProfileUrl: () => void;
  onLinkClick?: (id: string) => void;
}

export function PreviewShareDialog({
  open,
  onOpenChange,
  profile,
  links,
  isLoggedIn,
  onShare,
  onCopyProfileUrl,
  onLinkClick,
}: PreviewShareDialogProps) {
  const [viewMode, setViewMode] = useState<"mobile" | "card">("mobile");
  const [copied, setCopied] = useState(false);

  const activeLinks = links.filter((link) => link.enabled);
  const displayUrl = `mylink.com/${profile.username || "guest"}`;

  const handleCopy = () => {
    onCopyProfileUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-4 sm:p-6">
        <DialogHeader className="mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-[10px] bg-primary-weak text-primary-main flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg">
                  방문자 화면 미리보기 · 공유
                </DialogTitle>
                <DialogDescription className="text-xs">
                  외부 방문자에게 공개되는 프로필 화면을 확인하고 링크를 공유하세요.
                </DialogDescription>
              </div>
            </div>

            {/* 모바일 / 카드 뷰 토글 */}
            <div className="inline-flex items-center rounded-full bg-neutral-weak border border-neutral-weak2 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === "mobile"
                    ? "bg-static-white text-primary-main shadow-2xs"
                    : "text-neutral-medium hover:text-neutral-main"
                }`}
              >
                <Smartphone className="w-3 h-3" />
                모바일
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === "card"
                    ? "bg-static-white text-primary-main shadow-2xs"
                    : "text-neutral-medium hover:text-neutral-main"
                }`}
              >
                <Monitor className="w-3 h-3" />
                카드 뷰
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* 프리뷰 스테이지 배경 */}
        <div className="rounded-[20px] bg-[#F7F8FB] border border-neutral-weak2 p-3 sm:p-5 max-h-[56vh] overflow-y-auto flex justify-center">
          <div
            className={`w-full transition-all duration-200 bg-static-white overflow-hidden ${
              viewMode === "mobile"
                ? "max-w-[340px] rounded-[28px] border-[3px] border-neutral-main/85 shadow-lg"
                : "max-w-md rounded-[22px] border border-neutral-weak2 shadow-sm"
            }`}
          >
            {/* 모바일 노치 바 */}
            {viewMode === "mobile" && (
              <div className="bg-static-white pt-2 pb-1.5 flex justify-center border-b border-neutral-weak1">
                <span className="w-16 h-1 rounded-full bg-neutral-weak3" />
              </div>
            )}

            {/* 프리뷰 커버 배너 */}
            <div className="relative h-24 w-full bg-gradient-to-r from-[#3549FF] via-[#4154FF] to-[#6181EA] overflow-hidden">
              <Image
                src="/cover.svg"
                alt=""
                fill
                className="object-cover object-center opacity-40 mix-blend-overlay"
              />
              <div className="absolute bottom-2 right-3">
                <Badge
                  variant="primary"
                  className="bg-static-white/90 text-primary-main border-transparent text-[10px]"
                >
                  VISITOR VIEW
                </Badge>
              </div>
            </div>

            {/* 프리뷰 본문 (방문자 전용 읽기 뷰: 수정/삭제 버튼 미노출) */}
            <div className="p-4 sm:p-5">
              <div className="-mt-12 mb-3 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[20px] border border-neutral-weak2 bg-neutral-weak p-0.5 shadow-sm overflow-hidden mb-2.5">
                  <Image
                    src={profile.avatarUrl || "/avatar.svg"}
                    alt={profile.displayName}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-full h-full object-cover rounded-[18px]"
                  />
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <h4 className="text-lg font-bold text-neutral-main">
                    {profile.displayName}
                  </h4>
                  <span className="font-mono text-xs text-neutral-medium">
                    @{profile.username}
                  </span>
                </div>

                {profile.badge && (
                  <div className="mt-1">
                    <Badge variant="primary" className="text-[10px]">
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-primary-main" />
                      {profile.badge}
                    </Badge>
                  </div>
                )}

                <p className="mt-2 text-xs text-neutral-strong1 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>

                {profile.email && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-neutral-strong1 bg-neutral-weak border border-neutral-weak2 px-2.5 py-0.5 rounded-full">
                    <Mail className="w-3 h-3 text-neutral-medium" />
                    {profile.email}
                  </span>
                )}
              </div>

              <SocialIconsBar socials={profile.socials} />

              {/* 방문자에게 보이는 링크 목록 */}
              <div className="mt-4 space-y-2">
                {!isLoggedIn ? (
                  <div className="text-center py-6 px-3 rounded-[14px] border border-dashed border-neutral-weak2 bg-neutral-weak/40 text-xs text-neutral-medium">
                    Google 로그인 후 등록한 링크가 이곳에 표시됩니다.
                  </div>
                ) : activeLinks.length > 0 ? (
                  activeLinks.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      showClicks={false}
                      onLinkClick={onLinkClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 px-3 rounded-[14px] border border-dashed border-neutral-weak2 bg-neutral-weak/40 text-xs text-neutral-medium">
                    아직 등록된 링크가 없습니다. 새 링크를 추가해 보세요!
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-weak1 text-center text-[11px] text-neutral-medium">
                Powered by <span className="font-bold text-primary-main">MyLink</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 공유 컨트롤 바 */}
        <div className="mt-4 pt-3.5 border-t border-neutral-weak2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 flex items-center justify-between gap-2 rounded-[12px] bg-neutral-weak border border-neutral-weak2 px-3 py-2 min-w-0">
            <span className="text-xs font-mono font-semibold text-neutral-main truncate">
              {displayUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-main hover:underline shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#008161]" />
                  <span className="text-[#008161]">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>복사</span>
                </>
              )}
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={onShare}
            className="h-10 px-5 rounded-[12px] text-xs sm:text-sm font-bold shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>프로필 공유하기</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
