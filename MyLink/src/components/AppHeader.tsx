"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { User } from "firebase/auth";
import {
  ChevronDown,
  Eye,
  Share2,
  Copy,
  Plus,
  LogOut,
  Link2,
  Flame,
  UserCog,
  UserPen,
  Globe,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons";
import { CustomLink, MyLinkProfile } from "@/types/mylink";
import { getDisplayName } from "@/lib/utils";

interface AppHeaderProps {
  user: User | null;
  profile?: MyLinkProfile;
  authLoading?: boolean;
  isLoggingIn?: boolean;
  links: CustomLink[];
  onLogin: () => void;
  onLogout: () => void;
  onOpenPreview: () => void;
  onShare: () => void;
  onCopyProfileUrl: () => void;
  onAddLink?: () => void;
  onOpenEditProfile?: () => void;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const menuItemClass =
  "flex w-full items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs sm:text-sm font-medium text-neutral-main cursor-pointer outline-none select-none transition-colors data-[highlighted]:bg-primary-weak data-[highlighted]:text-primary-main";

export function AppHeader({
  user,
  profile,
  authLoading,
  isLoggingIn,
  links,
  onLogin,
  onLogout,
  onOpenPreview,
  onShare,
  onCopyProfileUrl,
  onAddLink,
  onOpenEditProfile,
}: AppHeaderProps) {
  const pathname = usePathname();
  let decodedPathname = pathname || "/";
  try {
    decodedPathname = decodeURIComponent(pathname || "/");
  } catch {
    decodedPathname = pathname || "/";
  }
  const isMyPage = pathname === "/mypage";
  const isStatsPage = pathname === "/stats";

  const displayName = user
    ? profile?.displayName && profile.displayName !== "MyLink"
      ? profile.displayName
      : getDisplayName(user)
    : "";
  const username = user
    ? profile?.username && profile.username !== "guest"
      ? profile.username
      : getDisplayName(user)
    : "guest";
  const personalSlug = user ? username : "";
  const personalPageHref = personalSlug
    ? `/${encodeURIComponent(personalSlug)}`
    : "/";
  const isPersonalPage =
    !!user &&
    !!personalSlug &&
    (decodedPathname.toLowerCase() === `/${personalSlug.toLowerCase()}` ||
      decodedPathname.toLowerCase() === `/@${personalSlug.toLowerCase()}` ||
      (!!displayName &&
        decodedPathname.toLowerCase() === `/${displayName.toLowerCase()}`));
  const avatarSrc =
    (user && profile?.avatarUrl && profile.avatarUrl !== "/avatar.svg"
      ? profile.avatarUrl
      : user?.photoURL) || "/avatar.svg";

  const activeLinks = links.filter((l) => l.enabled);
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const topLink =
    activeLinks.length > 0
      ? activeLinks.reduce((best, cur) =>
          (cur.clicks || 0) > (best.clicks || 0) ? cur : best
        )
      : null;
  const isGoogle = user?.providerData.some((p) => p.providerId === "google.com");
  const handleUrl = `mylink.com/${username}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-static-white/90 backdrop-blur-md border-b border-neutral-weak2">
      <div className="mx-auto max-w-2xl h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* 좌측: 심플 브랜드 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 hover:opacity-85 transition-opacity"
        >
          <span className="w-7 h-7 rounded-[9px] bg-primary-main flex items-center justify-center text-static-white">
            <Link2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
          <span className="font-bold text-base tracking-tight text-neutral-main">
            MyLink
          </span>
        </Link>

        {/* 우측: 인증 상태별 정돈된 컨트롤 */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {authLoading ? (
            <div className="h-8 w-28 rounded-full bg-neutral-weak2/70 animate-pulse" />
          ) : !user ? (
            <Button
              onClick={onLogin}
              disabled={isLoggingIn}
              variant="outline"
              size="sm"
              className="rounded-full text-xs font-semibold h-8 px-3.5 gap-1.5 border-neutral-weak2 hover:border-primary-weak2 hover:text-primary-main bg-static-white"
            >
              <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{isLoggingIn ? "로그인 중..." : "Google로 로그인"}</span>
            </Button>
          ) : (
            <>
              <Button
                variant={isPersonalPage ? "secondary" : "ghost"}
                size="sm"
                render={<Link href={personalPageHref} prefetch={false} />}
                title={`내 개인 페이지로 이동 (/${personalSlug})`}
                className={`rounded-full text-xs font-semibold h-8 px-2.5 sm:px-3 gap-1 ${
                  isPersonalPage
                    ? "text-primary-main"
                    : "text-neutral-strong1 hover:text-primary-main"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>내 페이지</span>
              </Button>

              <Button
                variant={isMyPage ? "secondary" : "ghost"}
                size="sm"
                render={<Link href="/mypage" />}
                className={`rounded-full text-xs font-semibold h-8 px-2.5 sm:px-3 gap-1 ${
                  isMyPage
                    ? "text-primary-main"
                    : "text-neutral-strong1 hover:text-primary-main"
                }`}
              >
                <UserCog className="w-3.5 h-3.5" />
                <span>마이 페이지</span>
              </Button>

              {/* 프로필 드롭다운 (Base UI Menu) */}
              <Menu.Root>
                <Menu.Trigger
                  className="flex items-center gap-2 h-8.5 pl-1 pr-2.5 rounded-full border border-neutral-weak2 bg-static-white hover:border-primary-weak2 hover:bg-primary-weak/30 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-main data-[popup-open]:border-primary-main"
                  aria-label="프로필 메뉴 열기"
                >
                  <Image
                    src={avatarSrc}
                    alt=""
                    width={26}
                    height={26}
                    unoptimized
                    className="w-6.5 h-6.5 rounded-full object-cover border border-neutral-weak2 shrink-0"
                  />
                  <span className="text-xs font-bold text-neutral-main max-w-[72px] sm:max-w-[130px] truncate">
                    {displayName}님
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-medium shrink-0" />
                </Menu.Trigger>

                <Menu.Portal>
                  <Menu.Positioner sideOffset={8} align="end" className="z-50 outline-none">
                    <Menu.Popup className="w-[296px] sm:w-[310px] origin-[var(--transform-origin)] rounded-[20px] border border-neutral-weak2 bg-static-white p-2.5 shadow-xl outline-none transition-[transform,opacity] duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
                      {/* 1. 계정 정보 */}
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Image
                          src={avatarSrc}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="w-10 h-10 rounded-full object-cover border border-neutral-weak2 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-neutral-main truncate">
                              {displayName}님
                            </span>
                            {isGoogle && (
                              <GoogleIcon className="w-3 h-3 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs font-mono text-neutral-strong1 truncate">
                            @{username}
                          </div>
                          <div className="text-[11px] text-neutral-medium truncate">
                            {user.email || "-"}
                          </div>
                        </div>
                      </div>

                      {/* 2. 프로필 주소 복사 바 */}
                      <div className="mx-1.5 my-1.5 flex items-center justify-between gap-2 rounded-[10px] bg-neutral-weak px-3 py-2">
                        <Menu.Item
                          render={<Link href={personalPageHref} prefetch={false} />}
                          className="text-xs font-mono text-neutral-strong1 hover:text-primary-main hover:underline truncate cursor-pointer outline-none min-w-0 flex-1"
                          title="내 개인 페이지로 이동"
                        >
                          {handleUrl}
                        </Menu.Item>
                        <Menu.Item
                          onClick={onCopyProfileUrl}
                          className="text-[11px] font-bold text-primary-main hover:underline cursor-pointer outline-none shrink-0"
                        >
                          복사
                        </Menu.Item>
                      </div>

                      {/* 3. 계정 요약 수치 */}
                      <div className="mx-1.5 mb-2 rounded-[12px] border border-neutral-weak2 px-3 py-2.5 space-y-2">
                        <div className="grid grid-cols-2 divide-x divide-neutral-weak2 text-center">
                          <div>
                            <div className="text-[11px] text-neutral-medium">활성 링크</div>
                            <div className="text-sm font-bold text-neutral-main mt-0.5">
                              {activeLinks.length}개
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-neutral-medium">총 클릭</div>
                            <div className="text-sm font-bold text-neutral-main mt-0.5">
                              {totalClicks.toLocaleString("ko-KR")}회
                            </div>
                          </div>
                        </div>

                        {topLink && (
                          <div className="pt-2 border-t border-neutral-weak1 flex items-center justify-between gap-2 text-[11px]">
                            <span className="flex items-center gap-1 text-neutral-medium truncate">
                              <Flame className="w-3 h-3 text-accent-main shrink-0" />
                              <span className="truncate text-neutral-main font-medium">
                                {topLink.title}
                              </span>
                            </span>
                            <span className="font-mono font-semibold text-primary-main shrink-0">
                              {(topLink.clicks || 0).toLocaleString("ko-KR")}회
                            </span>
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-neutral-weak1 flex items-center justify-between text-[10px] text-neutral-medium">
                          <span>가입 {formatDate(user.metadata.creationTime)}</span>
                          <span>최근 {formatDateTime(user.metadata.lastSignInTime)}</span>
                        </div>
                      </div>

                      <Menu.Separator className="my-1 h-px bg-neutral-weak2" />

                      {/* 4. 개인 페이지 · 마이 페이지 · 통계 · 공유 메뉴 */}
                      <Menu.Group>
                        <Menu.Item
                          className={menuItemClass}
                          render={<Link href={personalPageHref} prefetch={false} />}
                        >
                          <ExternalLink className="w-4 h-4 text-primary-main shrink-0" />
                          <span className="flex-1">내 개인 페이지 이동</span>
                          <span className="text-[11px] font-mono text-neutral-medium truncate max-w-[110px]">
                            /{personalSlug}
                          </span>
                        </Menu.Item>

                        <Menu.Item
                          className={menuItemClass}
                          render={<Link href="/mypage" />}
                        >
                          <UserCog className="w-4 h-4 text-primary-main shrink-0" />
                          <span>마이 페이지 (프로필 관리)</span>
                        </Menu.Item>

                        <Menu.Item
                          className={`${menuItemClass} ${
                            isStatsPage ? "bg-primary-weak/70 text-primary-main font-semibold" : ""
                          }`}
                          render={<Link href="/stats" />}
                        >
                          <BarChart3 className="w-4 h-4 text-primary-main shrink-0" />
                          <span className="flex-1">통계 페이지</span>
                          <span className="text-[11px] font-mono text-neutral-medium tabular-nums">
                            {totalClicks.toLocaleString("ko-KR")}회
                          </span>
                        </Menu.Item>

                        {pathname !== "/" && (
                          <Menu.Item
                            className={menuItemClass}
                            render={<Link href="/" />}
                          >
                            <Link2 className="w-4 h-4 text-neutral-medium shrink-0" />
                            <span>링크 편집 홈</span>
                          </Menu.Item>
                        )}

                        {onOpenEditProfile && (
                          <Menu.Item
                            className={menuItemClass}
                            onClick={onOpenEditProfile}
                          >
                            <UserPen className="w-4 h-4 text-neutral-medium shrink-0" />
                            <span>프로필 빠른 수정</span>
                          </Menu.Item>
                        )}

                        <Menu.Item className={menuItemClass} onClick={onOpenPreview}>
                          <Eye className="w-4 h-4 text-neutral-medium shrink-0" />
                          <span>미리보기 · 공유</span>
                        </Menu.Item>
                        <Menu.Item className={menuItemClass} onClick={onShare}>
                          <Share2 className="w-4 h-4 text-neutral-medium shrink-0" />
                          <span>프로필 공유하기</span>
                        </Menu.Item>
                        <Menu.Item className={menuItemClass} onClick={onCopyProfileUrl}>
                          <Copy className="w-4 h-4 text-neutral-medium shrink-0" />
                          <span>링크 복사</span>
                        </Menu.Item>
                        {onAddLink && (
                          <Menu.Item className={menuItemClass} onClick={onAddLink}>
                            <Plus className="w-4 h-4 text-neutral-medium shrink-0" />
                            <span>새 링크 추가</span>
                          </Menu.Item>
                        )}
                      </Menu.Group>

                      <Menu.Separator className="my-1 h-px bg-neutral-weak2" />

                      {/* 5. 로그아웃 */}
                      <Menu.Item
                        onClick={onLogout}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs sm:text-sm font-medium text-accent-main cursor-pointer outline-none select-none transition-colors data-[highlighted]:bg-accent-weak"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>로그아웃</span>
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>

              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                title="로그아웃"
                className="hidden sm:inline-flex rounded-full text-xs font-medium h-8 px-2.5 text-neutral-medium hover:text-accent-main"
              >
                로그아웃
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
