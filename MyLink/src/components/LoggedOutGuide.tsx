"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons";

interface LoggedOutGuideProps {
  onLogin: () => void;
  isLoggingIn?: boolean;
}

export function LoggedOutGuide({ onLogin, isLoggingIn }: LoggedOutGuideProps) {
  return (
    <div className="w-full rounded-[20px] border border-neutral-weak2 bg-neutral-weak/60 px-5 py-7 text-center">
      <div className="w-10 h-10 rounded-full bg-primary-weak text-primary-main mx-auto mb-3.5 flex items-center justify-center">
        <Lock className="w-4 h-4" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-neutral-main tracking-tight">
        로그인 후 내 링크를 관리할 수 있습니다
      </h3>

      <p className="text-xs sm:text-sm text-neutral-strong1 leading-relaxed max-w-sm mx-auto mt-1.5 mb-5">
        Google 계정으로 로그인하면 개인 전용 경로에 링크를 추가·수정하고 클릭 수를 확인할 수 있습니다.
      </p>

      <Button
        onClick={onLogin}
        disabled={isLoggingIn}
        size="default"
        variant="outline"
        className="rounded-full px-5 h-10 font-bold text-xs sm:text-sm bg-static-white hover:border-primary-weak2 hover:text-primary-main shadow-2xs gap-2"
      >
        <GoogleIcon className="w-4 h-4" />
        <span>{isLoggingIn ? "로그인 중..." : "Google로 로그인"}</span>
      </Button>
    </div>
  );
}
