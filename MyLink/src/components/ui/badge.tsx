import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center text-[11px] font-bold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        // NOL 신규 / 대표 배지 (알약형, 연파랑 바탕 + 파란 글자 + 연파랑 테두리)
        primary:
          "bg-primary-weak text-primary-main border border-primary-weak2 rounded-full px-2.5 py-0.5",
        default:
          "bg-primary-weak text-primary-main border border-primary-weak2 rounded-full px-2.5 py-0.5",
        // NOL 공지형 솔리드 파랑 배지
        notice:
          "bg-primary-main text-static-white rounded-full px-2 py-0.5",
        // NOL 할인/긴박/HOT 배지 (연빨강 바탕 + 빨강 글자)
        accent:
          "bg-accent-weak text-accent-main rounded-[6px] px-2 py-0.5 font-bold",
        // NOL 카드 텍스트 레이블 배지 (연회색 바탕 + 보조 글자)
        label:
          "bg-neutral-weak1 text-neutral-strong1 rounded-[6px] px-2 py-0.5",
        // 인증 / 서브 배지
        neutral:
          "bg-neutral-weak text-neutral-main border border-neutral-weak2 rounded-full px-2.5 py-0.5",
        outline:
          "border border-neutral-weak3 bg-static-white text-neutral-main rounded-full px-2.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
