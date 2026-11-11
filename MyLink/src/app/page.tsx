"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useMyLinkData } from "@/hooks/useMyLinkData";
import { AppHeader } from "@/components/AppHeader";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SocialIconsBar } from "@/components/SocialIconsBar";
import { LinkCard } from "@/components/LinkCard";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PreviewShareDialog } from "@/components/PreviewShareDialog";
import { WindowHeader, BottomActions } from "@/components/ShareUtility";
import { LoggedOutGuide } from "@/components/LoggedOutGuide";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RotateCw } from "lucide-react";
import { CustomLink } from "@/types/mylink";

export default function MyLinkPage() {
  const { user, loading: authLoading, isSigningIn, authError, signInWithGoogle, logout } = useAuth();
  const {
    profile,
    links,
    isLoaded,
    isProfileLoaded,
    isSyncing,
    deletingId,
    toastMessage,
    toastType,
    showToast,
    addLink,
    updateLink,
    deleteLink,
    refreshLinks,
    trackLinkClick,
    copyToClipboard,
    checkUsernameAvailability,
    updateProfile,
  } = useMyLinkData(user);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [targetDeleteLink, setTargetDeleteLink] = useState<CustomLink | null>(null);

  useEffect(() => {
    if (authError) showToast(authError, "error");
  }, [authError, showToast]);

  const getPersonalProfileUrl = () => {
    if (typeof window === "undefined") return "";
    if (user && profile.username && profile.username !== "guest") {
      return `${window.location.origin}/${encodeURIComponent(profile.username)}`;
    }
    return window.location.href;
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

  const handleCopyEmail = (email: string) => {
    copyToClipboard(email, "이메일 주소");
  };

  const handleCopyProfileUrl = () => {
    copyToClipboard(getPersonalProfileUrl(), "전체 프로필 링크");
  };

  const handleAddLinkClick = () => {
    if (!user) {
      showToast("Google 계정으로 로그인 후 새 링크를 추가할 수 있습니다.", "error");
      return;
    }
    setIsAddDialogOpen(true);
  };

  const handleOpenEditProfile = () => {
    if (!user) {
      showToast("Google 계정으로 로그인 후 프로필을 수정할 수 있습니다.", "error");
      return;
    }
    setIsEditProfileOpen(true);
  };

  const enabledLinks = links.filter((link) => link.enabled);

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
        onAddLink={handleAddLinkClick}
        onOpenEditProfile={handleOpenEditProfile}
      />

      <AddLinkDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddLink={addLink}
      />

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={profile}
        isProfileLoaded={isProfileLoaded}
        onCheckUsername={checkUsernameAvailability}
        onSaveProfile={updateProfile}
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

      <DeleteConfirmDialog
        open={!!targetDeleteLink}
        onOpenChange={(open) => {
          if (!open) setTargetDeleteLink(null);
        }}
        linkTitle={targetDeleteLink?.title || ""}
        isDeleting={targetDeleteLink ? deletingId === targetDeleteLink.id : false}
        onConfirm={async () => {
          if (targetDeleteLink) {
            await deleteLink(targetDeleteLink.id);
            setTargetDeleteLink(null);
          }
        }}
      />

      <main className="flex-1 flex flex-col items-center justify-start py-6 sm:py-12 px-4 sm:px-6">
        <Card className="w-full max-w-lg bg-static-white border border-neutral-weak2 rounded-[24px] sm:rounded-[28px] shadow-nol-1 overflow-hidden">
          <WindowHeader
            user={user}
            username={profile.username}
            linkToPersonalPage={!!user}
            onShare={handleShare}
            onOpenPreview={() => setIsPreviewOpen(true)}
          />

          {/* 커버 배너 */}
          <div className="relative h-28 sm:h-32 w-full bg-gradient-to-r from-[#3549FF] via-[#4154FF] to-[#6181EA] overflow-hidden">
            <Image
              src="/cover.svg"
              alt="MyLink Cover"
              fill
              className="object-cover object-center opacity-35 mix-blend-overlay"
            />
          </div>

          {/* 본문 */}
          <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 bg-static-white relative">
            <div className="-mt-16 mb-3">
              <ProfileHeader
                profile={profile}
                onCopyEmail={handleCopyEmail}
                onEditProfile={handleOpenEditProfile}
                isLoggedIn={!!user}
              />
            </div>

            <SocialIconsBar socials={profile.socials} />

            {/* 로그인 여부에 따른 심플한 본문 영역 */}
            <div className="mt-7">
              {!user ? (
                <LoggedOutGuide
                  onLogin={signInWithGoogle}
                  isLoggingIn={isSigningIn}
                />
              ) : (
                <>
                  {/* 링크 섹션 헤더 */}
                  <div className="mb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm tracking-tight text-neutral-main">
                        내 링크
                      </h2>
                      <Badge variant="primary" className="text-[11px] px-2 py-0 h-5">
                        {enabledLinks.length}
                      </Badge>
                      {isSyncing && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-main" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => refreshLinks()}
                        disabled={isSyncing}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-medium hover:text-primary-main hover:bg-neutral-weak1 transition-colors cursor-pointer disabled:opacity-50"
                        title="새로고침"
                        aria-label="새로고침"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-primary-main" : ""}`} />
                      </button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleAddLinkClick}
                        className="h-8 text-xs px-3 rounded-full font-bold gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>새 링크</span>
                      </Button>
                    </div>
                  </div>

                  {/* 링크 카드 목록 */}
                  <div className="space-y-2.5">
                    {!isLoaded ? (
                      <div className="space-y-2.5 animate-pulse">
                        <div className="h-16 rounded-[16px] bg-neutral-weak2/60" />
                        <div className="h-16 rounded-[16px] bg-neutral-weak2/60" />
                      </div>
                    ) : enabledLinks.length > 0 ? (
                      enabledLinks.map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          isDeleting={deletingId === link.id}
                          onLinkClick={trackLinkClick}
                          onRequestDelete={(target) => setTargetDeleteLink(target)}
                          onUpdate={updateLink}
                        />
                      ))
                    ) : (
                      <div className="text-center py-9 px-4 rounded-[16px] border border-dashed border-neutral-weak2 bg-neutral-weak/40 text-xs sm:text-sm text-neutral-medium">
                        등록된 링크가 없습니다. 새 링크를 추가해 보세요.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddLinkClick}
                      className="w-full py-3 px-4 rounded-[16px] border border-dashed border-neutral-weak3 hover:border-primary-main text-neutral-strong1 hover:text-primary-main bg-transparent hover:bg-primary-weak/30 transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>새 링크 카드 추가</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <BottomActions
              onCopyAll={handleCopyProfileUrl}
              email={profile.email}
            />

            <div className="mt-7 text-center">
              <p className="text-[11px] text-neutral-medium">
                Powered by <span className="text-primary-main font-semibold">MyLink</span>
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
