"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useMyLinkData } from "@/hooks/useMyLinkData";
import { AppHeader } from "@/components/AppHeader";
import { LinkCard } from "@/components/LinkCard";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { PreviewShareDialog } from "@/components/PreviewShareDialog";
import { LoggedOutGuide } from "@/components/LoggedOutGuide";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  UserPen,
  Eye,
  Copy,
  CheckCircle2,
  Mail,
  ExternalLink,
  MousePointerClick,
  RotateCw,
  Link2,
  Plus,
  Loader2,
} from "lucide-react";

export default function MyPage() {
  const {
    user,
    loading: authLoading,
    isSigningIn,
    authError,
    signInWithGoogle,
    logout,
  } = useAuth();

  const {
    profile,
    links,
    isLoaded,
    isProfileLoaded,
    isSyncing,
    toastMessage,
    toastType,
    showToast,
    refreshLinks,
    trackLinkClick,
    copyToClipboard,
    checkUsernameAvailability,
    updateProfile,
  } = useMyLinkData(user);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (authError) showToast(authError, "error");
  }, [authError, showToast]);

  const getPersonalProfileUrl = () => {
    if (typeof window === "undefined") return "";
    if (user && profile.username && profile.username !== "guest") {
      return `${window.location.origin}/${encodeURIComponent(profile.username)}`;
    }
    return window.location.origin;
  };

  const handleShare = async () => {
    const shareUrl = getPersonalProfileUrl();
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} (@${profile.username}) | MyLink`,
          text: profile.bio,
          url: shareUrl,
        });
      } catch {
        // 사용자 취소 시 무시
      }
    } else {
      copyToClipboard(shareUrl, "프로필 링크");
    }
  };

  const handleCopyProfileUrl = () => {
    copyToClipboard(getPersonalProfileUrl(), "전체 프로필 링크");
  };

  const activeLinksCount = links.filter((l) => l.enabled).length;
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-neutral-main flex flex-col selection:bg-primary-weak selection:text-primary-main">
      <Toast message={toastMessage} type={toastType} />

      <AppHeader
        user={user}
        profile={profile}
        authLoading={authLoading}
        isLoggingIn={isSigningIn}
        links={links}
        onLogin={signInWithGoogle}
        onLogout={logout}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onShare={handleShare}
        onCopyProfileUrl={handleCopyProfileUrl}
      />

      <PreviewShareDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        profile={profile}
        links={links}
        isLoggedIn={!!user}
        onShare={handleShare}
        onCopyProfileUrl={handleCopyProfileUrl}
        onLinkClick={trackLinkClick}
      />

      <main className="flex-1 flex flex-col items-center justify-start py-6 sm:py-10 px-4 sm:px-6">
        <div className="w-full max-w-lg space-y-4">
          {/* 상단 복귀 내비게이션 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/" />}
              className="rounded-full px-3 h-8 text-xs font-semibold text-neutral-strong1 hover:text-primary-main gap-1.5 -ml-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>내 링크 페이지로</span>
            </Button>

            <Badge variant="primary" className="text-[11px] font-bold">
              MY PAGE
            </Badge>
          </div>

          {authLoading ? (
            <Card className="w-full bg-static-white border border-neutral-weak2 rounded-[24px] p-6 sm:p-8 shadow-nol-1 space-y-4 animate-pulse">
              <div className="h-20 rounded-[16px] bg-neutral-weak2/70" />
              <div className="h-48 rounded-[16px] bg-neutral-weak2/70" />
            </Card>
          ) : !user ? (
            <Card className="w-full bg-static-white border border-neutral-weak2 rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 shadow-nol-1">
              <div className="mb-4 text-center">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-main">
                  마이 페이지
                </h1>
                <p className="text-xs sm:text-sm text-neutral-strong1 mt-1">
                  프로필을 관리하려면 먼저 Google 계정으로 로그인해 주세요.
                </p>
              </div>
              <LoggedOutGuide
                onLogin={signInWithGoogle}
                isLoggingIn={isSigningIn}
              />
            </Card>
          ) : (
            <>
              {/* 1. 현재 프로필 요약 카드 */}
              <Card className="w-full bg-static-white border border-neutral-weak2 rounded-[24px] sm:rounded-[28px] shadow-nol-1 overflow-hidden">
                <div className="relative h-20 w-full bg-gradient-to-r from-[#3549FF] via-[#4154FF] to-[#6181EA] overflow-hidden">
                  <Image
                    src="/cover.svg"
                    alt=""
                    fill
                    className="object-cover object-center opacity-35 mix-blend-overlay"
                  />
                </div>

                <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-6">
                  <div className="-mt-11 flex items-end justify-between gap-3 mb-3">
                    <div className="w-20 h-20 rounded-[20px] border border-neutral-weak2 bg-static-white p-1 shadow-sm overflow-hidden shrink-0">
                      <Image
                        src={profile.avatarUrl || "/avatar.svg"}
                        alt={profile.displayName}
                        width={80}
                        height={80}
                        unoptimized
                        className="w-full h-full object-cover rounded-[16px]"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewOpen(true)}
                      className="rounded-full h-8 px-3 text-xs font-semibold gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary-main" />
                      <span>미리보기</span>
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-lg sm:text-xl font-bold text-neutral-main truncate">
                        {profile.displayName}
                      </h1>
                      <CheckCircle2 className="w-4 h-4 text-primary-main shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-medium">
                      <span className="font-mono text-neutral-strong1 font-semibold">
                        @{profile.username}
                      </span>
                      {user.email && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{user.email}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="mt-2.5 text-xs sm:text-sm text-neutral-strong1 leading-relaxed whitespace-pre-line">
                      {profile.bio}
                    </p>
                  )}

                  {/* 주소 복사 + 요약 지표 */}
                  <div className="mt-4 pt-4 border-t border-neutral-weak1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center justify-between sm:justify-start gap-2 rounded-[10px] bg-neutral-weak px-3 py-1.5 min-w-0">
                      <Link
                        href={`/${encodeURIComponent(profile.username)}`}
                        prefetch={false}
                        className="inline-flex items-center gap-1 text-xs font-mono text-neutral-strong1 hover:text-primary-main hover:underline truncate"
                        title="내 개인 페이지로 이동"
                      >
                        <span className="truncate">mylink.com/{profile.username}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                      <button
                        type="button"
                        onClick={handleCopyProfileUrl}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-main hover:underline shrink-0 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>복사</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-medium shrink-0">
                      <span>
                        활성 링크{" "}
                        <strong className="text-neutral-main font-bold">
                          {activeLinksCount}개
                        </strong>
                      </span>
                      <Link
                        href="/stats"
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-semibold tabular-nums transition-colors ${
                          totalClicks > 0
                            ? "bg-primary-weak/80 text-primary-main border-primary-weak2/80 hover:bg-primary-weak"
                            : "bg-neutral-weak text-neutral-strong1 border-neutral-weak2 hover:border-primary-weak2 hover:text-primary-main"
                        }`}
                        title={`총 조회수 ${totalClicks.toLocaleString("ko-KR")} · 통계 페이지 보기`}
                        aria-label={`총 조회수 ${totalClicks.toLocaleString("ko-KR")} · 통계 페이지 보기`}
                      >
                        <MousePointerClick className="w-3 h-3 shrink-0" />
                        <span>{totalClicks.toLocaleString("ko-KR")}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 2. 내 링크 조회수 카드 */}
              <Card className="w-full bg-static-white border border-neutral-weak2 rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-nol-1">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3.5 border-b border-neutral-weak1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-9 h-9 rounded-[12px] bg-primary-weak text-primary-main flex items-center justify-center shrink-0">
                      <Link2 className="w-4 h-4" />
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-neutral-main truncate">
                        내 링크
                      </h2>
                      <Badge variant="primary" className="text-[11px] px-2 py-0 h-5 shrink-0">
                        {links.length}
                      </Badge>
                      {isSyncing && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-main shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => refreshLinks()}
                      disabled={isSyncing}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-medium hover:text-primary-main hover:bg-neutral-weak1 transition-colors cursor-pointer disabled:opacity-50"
                      title="새로고침"
                      aria-label="새로고침"
                    >
                      <RotateCw
                        className={`w-3.5 h-3.5 ${
                          isSyncing ? "animate-spin text-primary-main" : ""
                        }`}
                      />
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href="/" />}
                      className="h-8 text-xs px-3 rounded-full font-semibold gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-primary-main" />
                      <span>링크 관리</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {!isLoaded ? (
                    <div className="space-y-2.5 animate-pulse">
                      <div className="h-16 rounded-[16px] bg-neutral-weak2/60" />
                      <div className="h-16 rounded-[16px] bg-neutral-weak2/60" />
                    </div>
                  ) : links.length > 0 ? (
                    links.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onLinkClick={trackLinkClick}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 px-4 rounded-[16px] border border-dashed border-neutral-weak2 bg-neutral-weak/40 space-y-3">
                      <p className="text-xs sm:text-sm text-neutral-medium">
                        등록된 링크가 없습니다.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        render={<Link href="/" />}
                        className="rounded-full text-xs font-bold gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>새 링크 추가하러 가기</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* 3. 프로필 수정 카드 */}
              <Card className="w-full bg-static-white border border-neutral-weak2 rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-nol-1">
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-neutral-weak1">
                  <span className="w-9 h-9 rounded-[12px] bg-primary-weak text-primary-main flex items-center justify-center shrink-0">
                    <UserPen className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-neutral-main">
                      프로필 수정
                    </h2>
                    <p className="text-xs text-neutral-strong1 mt-0.5">
                      username(중복 확인) 및 소개글을 수정하여 내 프로필을 꾸며보세요.
                    </p>
                  </div>
                </div>

                <ProfileEditForm
                  profile={profile}
                  isProfileLoaded={isProfileLoaded}
                  onCheckUsername={checkUsernameAvailability}
                  onSaveProfile={updateProfile}
                />
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
