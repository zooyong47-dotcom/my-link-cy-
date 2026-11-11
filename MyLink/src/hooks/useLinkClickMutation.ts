"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomLink } from "@/types/mylink";
import {
  myLinkKeys,
  incrementUserLinkClick,
  adjustLinkClickInList,
} from "@/lib/queries/mylink";

interface UseLinkClickMutationOptions {
  uid: string;
  onError?: (err: unknown) => void;
}

/**
 * 링크 클릭 시 낙관적으로 클릭수를 +1 반영하고 Firestore에 저장하며,
 * 실패 시 롤백하고 성공 시 서버 상태와 동기화하는 공용 훅입니다.
 */
export function useLinkClickMutation({
  uid,
  onError,
}: UseLinkClickMutationOptions) {
  const queryClient = useQueryClient();
  const mutationKey = myLinkKeys.clickLink(uid || "anon");

  return useMutation({
    mutationKey,
    mutationFn: async (linkId: string) => {
      if (!uid) return;
      await incrementUserLinkClick(uid, linkId);
    },
    onMutate: async (linkId) => {
      if (!uid) return;
      queryClient.setQueryData<CustomLink[]>(myLinkKeys.links(uid), (old) =>
        adjustLinkClickInList(old, linkId, 1)
      );
    },
    onSuccess: () => {
      if (uid && queryClient.isMutating({ mutationKey }) <= 1) {
        queryClient.invalidateQueries({ queryKey: myLinkKeys.links(uid) });
      }
    },
    onError: (err, linkId) => {
      if (uid) {
        queryClient.setQueryData<CustomLink[]>(myLinkKeys.links(uid), (old) =>
          adjustLinkClickInList(old, linkId, -1)
        );
      }
      onError?.(err);
    },
  });
}
