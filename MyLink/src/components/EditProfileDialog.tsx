"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { MyLinkProfile } from "@/types/mylink";
import { UsernameCheckResult } from "@/hooks/useMyLinkData";
import { UpdateProfileInput } from "@/lib/validations/profile";
import { UserPen, ArrowUpRight } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MyLinkProfile;
  isProfileLoaded?: boolean;
  onCheckUsername: (username: string) => Promise<UsernameCheckResult>;
  onSaveProfile: (data: UpdateProfileInput) => Promise<void>;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  isProfileLoaded,
  onCheckUsername,
  onSaveProfile,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-[10px] bg-primary-weak text-primary-main">
                <UserPen className="w-4 h-4" />
              </span>
              <DialogTitle>프로필 수정</DialogTitle>
            </div>
            <Link
              href="/mypage"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary-main hover:underline"
            >
              <span>마이 페이지로 이동</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DialogDescription>
            username, 이름, 소개글을 수정하고 내 프로필에 바로 반영하세요.
          </DialogDescription>
        </DialogHeader>

        <ProfileEditForm
          profile={profile}
          isProfileLoaded={isProfileLoaded}
          onCheckUsername={onCheckUsername}
          onSaveProfile={onSaveProfile}
          onCancel={() => onOpenChange(false)}
          onOptimisticSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
