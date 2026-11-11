"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useMyLinkData } from "@/hooks/useMyLinkData";
import { AppHeader } from "@/components/AppHeader";
import { PreviewShareDialog } from "@/components/PreviewShareDialog";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDisplayName } from "@/lib/utils";
import { SearchX, Home, Globe } from "lucide-react";

export function UserNotFoundView() {
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
    toastMessage,
    toastType,
    showToast,
    trackLinkClick,
    copyToClipboard,
  } = useMyLinkData(user);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (authError) showToast(authError, "error");
  }, [authError, showToast]);

  const personalSlug = user
    ? profile.username && profile.username !== "guest"
      ? profile.username
      : getDisplayName(user)
    : "";

  const getPersonalUrl = () => {
    if (typeof window === "undefined") return "";
    if (personalSlug) {
      return `${window.location.origin}/${encodeURIComponent(personalSlug)}`;
    }
    return window.location.origin;
  };

  const handleShare = async () => {
    const shareUrl = getPersonalUrl();
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
    copyToClipboard(getPersonalUrl(), "프로필 링크");
  };

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

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
        <Card className="w-full max-w-md bg-static-white border border-neutral-weak2 rounded-[24px] sm:rounded-[28px] p-7 sm:p-9 shadow-nol-1 text-center">
          <div className="mx-auto w-14 h-14 rounded-[18px] bg-primary-weak border border-primary-weak2 text-primary-main flex items-center justify-center mb-4">
            <SearchX className="w-7 h-7" />
          </div>

          <Badge variant="primary" className="text-[11px] font-bold mb-3">
            404 NOT FOUND
          </Badge>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-main">
            프로필을 찾을 수 없습니다
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-neutral-strong1 leading-relaxed">
            요청하신 username(또는 displayname)을 가진 사용자가 존재하지 않거나
            주소가 변경되었습니다. 입력하신 주소를 다시 확인해 주세요.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button
              variant="primary"
              render={<Link href="/" />}
              className="w-full sm:w-auto rounded-[12px] h-11 px-5 font-bold gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>홈으로 이동</span>
            </Button>

            {user && personalSlug && (
              <Button
                variant="secondary"
                render={
                  <Link
                    href={`/${encodeURIComponent(personalSlug)}`}
                    prefetch={false}
                  />
                }
                className="w-full sm:w-auto rounded-[12px] h-11 px-5 font-bold gap-1.5"
              >
                <Globe className="w-4 h-4" />
                <span>내 페이지로 이동</span>
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
