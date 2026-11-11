"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMyLinkData } from "@/hooks/useMyLinkData";
import { useLinkClickMutation } from "@/hooks/useLinkClickMutation";
import {
  myLinkKeys,
  fetchUserProfileByUid,
  fetchUserLinks,
} from "@/lib/queries/mylink";
import { AppHeader } from "@/components/AppHeader";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SocialIconsBar } from "@/components/SocialIconsBar";
import { LinkCard } from "@/components/LinkCard";
import { PreviewShareDialog } from "@/components/PreviewShareDialog";
import { WindowHeader, BottomActions } from "@/components/ShareUtility";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomLink, MyLinkProfile } from "@/types/mylink";
import { RotateCw, Loader2, Pencil, UserCog, Plus } from "lucide-react";

interface PublicProfileViewProps {
  targetUid: string;
  initialProfile: MyLinkProfile;
  initialLinks: CustomLink[];
  serverFetchedAt: number;
}

export function PublicProfileView({
  targetUid,
  initialProfile,
  initialLinks,
  serverFetchedAt,
}: PublicProfileViewProps) {
  const {
    user,
    loading: authLoading,
    isSigningIn,
    authError,
    signInWithGoogle,
    logout,
  } = useAuth();

  const {
    profile: viewerProfile,
    links: viewerLinks,
    toastMessage,
    toastType,
    showToast,
    trackLinkClick: trackViewerLinkClick,
    copyToClipboard,
  } = useMyLinkData(user);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (authError) showToast(authError, "error");
  }, [authError, showToast]);

  const targetProfileQuery = useQuery({
    queryKey: myLinkKeys.profile(targetUid),
    queryFn: () => fetchUserProfileByUid(targetUid),
    initialData: initialProfile,
    initialDataUpdatedAt: serverFetchedAt,
  });

  const targetLinksQuery = useQuery({
    queryKey: myLinkKeys.links(targetUid),
    queryFn: () => fetchUserLinks(targetUid),
    initialData: initialLinks,
    initialDataUpdatedAt: serverFetchedAt,
    refetchOnWindowFocus: true,
  });

  const publicProfile = targetProfileQuery.data ?? initialProfile;
  const publicLinks = targetLinksQuery.data ?? initialLinks;
  const enabledLinks = publicLinks.filter((link) => link.enabled);
  const isOwner = !!user && user.uid === targetUid;
  const isRefreshing =
    targetProfileQuery.isFetching || targetLinksQuery.isFetching;

  const clickPublicLinkMutation = useLinkClickMutation({
    uid: targetUid,
    onError: (err) => {
      console.warn("public link click save failed:", err);
      if (isOwner) {
        showToast("클릭수 저장에 실패했습니다.", "error");
      }
    },
  });

  const getTargetPageUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/${encodeURIComponent(
      publicProfile.username
    )}`;
  };

  const getViewerPageUrl = () => {
    if (typeof window === "undefined") return "";
    if (user && viewerProfile.username && viewerProfile.username !== "guest") {
      return `${window.location.origin}/${encodeURIComponent(
        viewerProfile.username
      )}`;
    }
    return window.location.origin;
  };

  const handleShareTarget = async () => {
    const shareUrl = getTargetPageUrl();
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${publicProfile.displayName} (@${publicProfile.username}) | MyLink`,
          text: publicProfile.bio,
          url: shareUrl,
        });
      } catch {
        // 사용자 취소 시 무시
      }
    } else {
      copyToClipboard(shareUrl, "프로필 링크");
    }
  };

  const handleShareViewer = async () => {
    const shareUrl = getViewerPageUrl();
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${viewerProfile.displayName} (@${viewerProfile.username}) | MyLink`,
          text: viewerProfile.bio,
          url: shareUrl,
        });
      } catch {
        // 사용자 취소 시 무시
      }
    } else {
      copyToClipboard(shareUrl, "내 프로필 링크");
    }
  };

  const handleCopyTargetUrl = () => {
    copyToClipboard(getTargetPageUrl(), "프로필 링크");
  };

  const handleCopyViewerUrl = () => {
    copyToClipboard(getViewerPageUrl(), "내 프로필 링크");
  };

  const handleCopyEmail = (email: string) => {
    copyToClipboard(email, "이메일 주소");
  };

  const handleRefreshPublicData = async () => {
    try {
      await Promise.all([
        targetProfileQuery.refetch(),
        targetLinksQuery.refetch(),
      ]);
      showToast("최신 프로필 정보를 불러왔습니다. ⚡", "success");
    } catch {
      showToast("새로고침 중 오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-neutral-main flex flex-col selection:bg-primary-weak selection:text-primary-main">
      <Toast message={toastMessage} type={toastType} />

      <AppHeader
        user={user}
        profile={viewerProfile}
        authLoading={authLoading}
        isLoggingIn={isSigningIn}
        links={viewerLinks}
        onLogin={signInWithGoogle}
        onLogout={logout}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onShare={handleShareViewer}
        onCopyProfileUrl={handleCopyViewerUrl}
      />

      <PreviewShareDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        profile={viewerProfile}
        links={viewerLinks}
        isLoggedIn={!!user}
        onShare={handleShareViewer}
        onCopyProfileUrl={handleCopyViewerUrl}
        onLinkClick={trackViewerLinkClick}
      />

      <main className="flex-1 flex flex-col items-center justify-start py-6 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-lg space-y-3">
          {isOwner && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-[11px] font-bold">
                  내 개인 페이지
                </Badge>
                <span className="text-xs text-neutral-strong1">
                  방문자에게 공개되는 화면입니다
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/" />}
                  className="rounded-full h-7 px-2.5 text-xs font-semibold gap-1 bg-static-white"
                >
                  <Pencil className="w-3 h-3 text-primary-main" />
                  <span>링크 편집</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/mypage" />}
                  className="rounded-full h-7 px-2.5 text-xs font-semibold gap-1 bg-static-white"
                >
                  <UserCog className="w-3 h-3 text-primary-main" />
                  <span>프로필 설정</span>
                </Button>
              </div>
            </div>
          )}

          <Card className="w-full bg-static-white border border-neutral-weak2 rounded-[24px] sm:rounded-[28px] shadow-nol-1 overflow-hidden">
            <WindowHeader
              username={publicProfile.username}
              onShare={handleShareTarget}
            />

            {/* 커버 배너 */}
            <div className="relative h-28 sm:h-32 w-full bg-gradient-to-r from-[#3549FF] via-[#4154FF] to-[#6181EA] overflow-hidden">
              <Image
                src="/cover.svg"
                alt={`${publicProfile.displayName} Cover`}
                fill
                className="object-cover object-center opacity-35 mix-blend-overlay"
              />
            </div>

            {/* 본문 */}
            <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 bg-static-white relative">
              <div className="-mt-16 mb-3">
                <ProfileHeader
                  profile={publicProfile}
                  onCopyEmail={handleCopyEmail}
                  isLoggedIn={true}
                />
              </div>

              <SocialIconsBar socials={publicProfile.socials} />

              {/* 공개 링크 목록 (users/{userID}/links) */}
              <div className="mt-7">
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm tracking-tight text-neutral-main">
                      링크
                    </h2>
                    <Badge
                      variant="primary"
                      className="text-[11px] px-2 py-0 h-5"
                    >
                      {enabledLinks.length}
                    </Badge>
                    {isRefreshing && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-main" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshPublicData}
                    disabled={isRefreshing}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-medium hover:text-primary-main hover:bg-neutral-weak1 transition-colors cursor-pointer disabled:opacity-50"
                    title="새로고침"
                    aria-label="새로고침"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 ${
                        isRefreshing ? "animate-spin text-primary-main" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {enabledLinks.length > 0 ? (
                    enabledLinks.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        showClicks={false}
                        onLinkClick={(linkId) =>
                          clickPublicLinkMutation.mutate(linkId)
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center py-9 px-4 rounded-[16px] border border-dashed border-neutral-weak2 bg-neutral-weak/40 space-y-3">
                      <p className="text-xs sm:text-sm text-neutral-medium">
                        아직 등록된 링크가 없습니다.
                      </p>
                      {isOwner && (
                        <Button
                          variant="secondary"
                          size="sm"
                          render={<Link href="/" />}
                          className="rounded-full text-xs font-bold gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>첫 링크 추가하러 가기</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <BottomActions
                onCopyAll={handleCopyTargetUrl}
                email={publicProfile.email}
              />

              <div className="mt-7 text-center">
                <p className="text-[11px] text-neutral-medium">
                  Powered by{" "}
                  <Link
                    href="/"
                    className="text-primary-main font-semibold hover:underline"
                  >
                    MyLink
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
