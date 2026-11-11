"use client";

import { useState, useCallback, useRef } from "react";
import { User } from "firebase/auth";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { CustomLink, MyLinkProfile } from "@/types/mylink";
import { normalizeUsername } from "@/lib/validations/profile";
import {
  myLinkKeys,
  getGuestProfile,
  getInitialUserProfile,
  fetchUserProfile,
  fetchUserLinks,
  checkUsernameInFirestore,
  createUserLink,
  patchUserLink,
  removeUserLink,
  saveUserProfile,
  CreateLinkPayload,
  UpdateLinkPayload,
  UpdateProfilePayload,
  UsernameCheckResult,
} from "@/lib/queries/mylink";
import { useLinkClickMutation } from "@/hooks/useLinkClickMutation";

export type { UsernameCheckResult };

export function useMyLinkData(user: User | null) {
  const queryClient = useQueryClient();
  const uid = user?.uid ?? "";

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToastMessage(msg);
      setToastType(type);
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    },
    []
  );

  // 1) 프로필 단발 조회 (useQuery)
  const profileQuery = useQuery({
    queryKey: myLinkKeys.profile(uid),
    queryFn: () => fetchUserProfile(user!),
    enabled: !!user,
  });

  // 2) 링크 목록 조회 (useQuery - 페이지 진입/탭 복귀 시 최신 클릭수 동기화)
  const linksQuery = useQuery({
    queryKey: myLinkKeys.links(uid),
    queryFn: () => fetchUserLinks(uid),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const profile: MyLinkProfile = !user
    ? getGuestProfile()
    : profileQuery.data ?? getInitialUserProfile(user);

  const links: CustomLink[] = !user ? [] : linksQuery.data ?? [];

  // 3) 새 링크 추가 (useMutation)
  const addLinkMutation = useMutation({
    mutationFn: async (newLinkData: CreateLinkPayload) => {
      if (!user) {
        throw new Error("링크를 추가하려면 먼저 Google 계정으로 로그인해 주세요.");
      }
      return createUserLink(user.uid, newLinkData);
    },
    onSuccess: (createdLink) => {
      queryClient.setQueryData<CustomLink[]>(
        myLinkKeys.links(uid),
        (old = []) => [createdLink, ...old]
      );
      queryClient.invalidateQueries({ queryKey: myLinkKeys.links(uid) });
      showToast("새 링크가 성공적으로 추가되었습니다! 🔥", "success");
    },
    onError: (err: any) => {
      console.error("addLink error:", err);
      showToast(
        err?.message || "링크 저장에 실패했습니다. 다시 시도해 주세요.",
        "error"
      );
    },
  });

  // 4) 링크 수정 (useMutation + 낙관적 캐시 업데이트 & 실패 시 롤백)
  const updateLinkMutation = useMutation({
    mutationFn: async ({
      linkId,
      updatedData,
    }: {
      linkId: string;
      updatedData: UpdateLinkPayload;
    }) => {
      if (!user) {
        throw new Error("수정 권한이 없습니다. 로그인해 주세요.");
      }
      return patchUserLink(user.uid, linkId, updatedData);
    },
    onMutate: async ({ linkId, updatedData }) => {
      await queryClient.cancelQueries({ queryKey: myLinkKeys.links(uid) });
      const previousLinks = queryClient.getQueryData<CustomLink[]>(
        myLinkKeys.links(uid)
      );

      if (previousLinks) {
        const now = Date.now();
        let nextUrl = updatedData.url.trim();
        if (
          !nextUrl.startsWith("http://") &&
          !nextUrl.startsWith("https://") &&
          !nextUrl.startsWith("mailto:")
        ) {
          nextUrl = `https://${nextUrl}`;
        }

        queryClient.setQueryData<CustomLink[]>(
          myLinkKeys.links(uid),
          previousLinks.map((item) =>
            item.id === linkId
              ? {
                  ...item,
                  title: updatedData.title.trim(),
                  url: nextUrl,
                  updatedAt: now,
                  ...(updatedData.subtitle !== undefined && {
                    subtitle: updatedData.subtitle.trim() || undefined,
                  }),
                  ...(updatedData.badge !== undefined && {
                    badge: updatedData.badge.trim() || undefined,
                  }),
                  ...(updatedData.icon !== undefined && {
                    icon: updatedData.icon,
                  }),
                  ...(updatedData.highlight !== undefined && {
                    highlight: !!updatedData.highlight,
                  }),
                }
              : item
          )
        );
      }

      return { previousLinks };
    },
    onSuccess: () => {
      showToast("링크가 성공적으로 갱신되었습니다! ✏️", "success");
    },
    onError: (err: any, _vars, context) => {
      console.error("updateLink error:", err);
      if (context?.previousLinks) {
        queryClient.setQueryData(myLinkKeys.links(uid), context.previousLinks);
      }
      showToast("링크 수정에 실패했습니다. 다시 시도해 주세요.", "error");
    },
    onSettled: () => {
      if (uid) {
        queryClient.invalidateQueries({ queryKey: myLinkKeys.links(uid) });
      }
    },
  });

  // 5) 링크 삭제 (useMutation + 낙관적 캐시 제거 & 실패 시 롤백)
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      if (!user) {
        throw new Error("삭제 권한이 없습니다. 로그인해 주세요.");
      }
      await removeUserLink(user.uid, linkId);
    },
    onMutate: async (linkId) => {
      await queryClient.cancelQueries({ queryKey: myLinkKeys.links(uid) });
      const previousLinks = queryClient.getQueryData<CustomLink[]>(
        myLinkKeys.links(uid)
      );

      if (previousLinks) {
        queryClient.setQueryData<CustomLink[]>(
          myLinkKeys.links(uid),
          previousLinks.filter((item) => item.id !== linkId)
        );
      }

      return { previousLinks };
    },
    onSuccess: () => {
      showToast("링크가 삭제되었습니다. 🗑️", "success");
    },
    onError: (err: any, _linkId, context) => {
      console.error("deleteLink error:", err);
      if (context?.previousLinks) {
        queryClient.setQueryData(myLinkKeys.links(uid), context.previousLinks);
      }
      showToast("링크 삭제에 실패했습니다.", "error");
    },
    onSettled: () => {
      if (uid) {
        queryClient.invalidateQueries({ queryKey: myLinkKeys.links(uid) });
      }
    },
  });

  // 6) 링크 클릭수 증가 (useMutation)
  const clickLinkMutation = useLinkClickMutation({
    uid,
    onError: (err) => {
      console.error("clickLink error:", err);
      showToast("클릭수 저장에 실패했습니다.", "error");
    },
  });

  // 7) 프로필 수정 (useMutation + 낙관적 캐시 업데이트 & 실패 시 롤백)
  const previousUsernameRef = useRef<string>(profile.username);

  const updateProfileMutation = useMutation({
    mutationFn: async (input: UpdateProfilePayload) => {
      if (!user) {
        throw new Error("프로필을 수정하려면 먼저 로그인해 주세요.");
      }
      return saveUserProfile(user.uid, input, previousUsernameRef.current);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: myLinkKeys.profile(uid) });

      const previousProfile = queryClient.getQueryData<MyLinkProfile>(
        myLinkKeys.profile(uid)
      );
      const baseProfile = previousProfile ?? profile;
      previousUsernameRef.current = baseProfile.username;

      const optimisticProfile: MyLinkProfile = {
        ...baseProfile,
        username: normalizeUsername(input.username),
        bio: input.bio.trim(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<MyLinkProfile>(
        myLinkKeys.profile(uid),
        optimisticProfile
      );

      return { previousProfile, fallbackProfile: baseProfile };
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<MyLinkProfile>(
        myLinkKeys.profile(uid),
        (prev) => ({
          ...(prev ?? profile),
          username: saved.username,
          bio: saved.bio,
          updatedAt: saved.updatedAt,
        })
      );
      queryClient.removeQueries({
        queryKey: ["mylink", "username-check"],
      });
      showToast("프로필 정보가 성공적으로 수정되었습니다! ✨", "success");
    },
    onError: (err: any, _input, context) => {
      console.error("updateProfile error:", err);
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(
          myLinkKeys.profile(uid),
          context.previousProfile
        );
      } else if (context?.fallbackProfile) {
        queryClient.setQueryData(
          myLinkKeys.profile(uid),
          context.fallbackProfile
        );
      }
      showToast(
        err?.message || "프로필 저장에 실패하여 이전 정보로 복구되었습니다.",
        "error"
      );
    },
    onSettled: () => {
      if (uid) {
        queryClient.invalidateQueries({ queryKey: myLinkKeys.profile(uid) });
      }
    },
  });

  // 수동 새로고침 (명시적 refetch)
  const refreshLinks = useCallback(
    async (silent: boolean = false) => {
      if (!user) {
        showToast("로그인 후 링크를 새로고침할 수 있습니다.", "error");
        return;
      }
      try {
        await Promise.all([linksQuery.refetch(), profileQuery.refetch()]);
        if (!silent) {
          showToast("최신 데이터로 새로고침되었습니다. ⚡", "success");
        }
      } catch (e) {
        console.error("refreshLinks error:", e);
        if (!silent) {
          showToast("새로고침 중 오류가 발생했습니다.", "error");
        }
      }
    },
    [user, linksQuery, profileQuery, showToast]
  );

  // username 중복 확인 (QueryClient fetchQuery 활용)
  const checkUsernameAvailability = useCallback(
    async (rawUsername: string): Promise<UsernameCheckResult> => {
      const normalized = normalizeUsername(rawUsername).toLowerCase();
      return queryClient.fetchQuery({
        queryKey: myLinkKeys.usernameCheck(user?.uid, normalized || rawUsername),
        queryFn: () =>
          checkUsernameInFirestore(rawUsername, user?.uid, profile.username),
        staleTime: 10 * 1000,
      });
    },
    [queryClient, user?.uid, profile.username]
  );

  const addLink = useCallback(
    (newLinkData: CreateLinkPayload) =>
      addLinkMutation.mutateAsync(newLinkData),
    [addLinkMutation]
  );

  const updateLink = useCallback(
    (linkId: string, updatedData: UpdateLinkPayload) =>
      updateLinkMutation.mutateAsync({ linkId, updatedData }),
    [updateLinkMutation]
  );

  const deleteLink = useCallback(
    (linkId: string) => deleteLinkMutation.mutateAsync(linkId),
    [deleteLinkMutation]
  );

  const trackLinkClick = useCallback(
    (linkId: string) => {
      if (!user) return;
      clickLinkMutation.mutate(linkId);
    },
    [user, clickLinkMutation]
  );

  const updateProfile = useCallback(
    async (input: UpdateProfilePayload) => {
      await updateProfileMutation.mutateAsync(input);
    },
    [updateProfileMutation]
  );

  const copyToClipboard = useCallback(
    async (text: string, label: string = "링크") => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
        }
        showToast(`${label}가 복사되었습니다! 🎉`, "success");
      } catch (err) {
        console.error("Copy failed:", err);
        showToast("복사에 실패했습니다.", "error");
      }
    },
    [showToast]
  );

  const isLoaded = !user ? true : !linksQuery.isLoading;
  const isProfileLoaded = !user ? true : !profileQuery.isLoading;
  const isSyncing =
    linksQuery.isFetching ||
    profileQuery.isFetching ||
    addLinkMutation.isPending ||
    updateLinkMutation.isPending ||
    deleteLinkMutation.isPending ||
    updateProfileMutation.isPending;
  const deletingId = deleteLinkMutation.isPending
    ? (deleteLinkMutation.variables ?? null)
    : null;

  return {
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
  };
}
