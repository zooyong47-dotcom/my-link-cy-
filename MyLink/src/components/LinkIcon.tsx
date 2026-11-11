"use client";

import React from "react";
import {
  Globe,
  BookOpen,
  FileText,
  MessageCircle,
} from "lucide-react";
import { GithubIcon, FigmaIcon, YoutubeIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface LinkIconProps {
  icon?: string;
  className?: string;
}

export function LinkIcon({ icon, className }: LinkIconProps) {
  switch (icon) {
    case "github":
      return <GithubIcon className={cn("w-5 h-5 text-neutral-main", className)} />;
    case "book-open":
      return <BookOpen className={cn("w-5 h-5 text-primary-main", className)} />;
    case "file-text":
      return <FileText className={cn("w-5 h-5 text-primary-main", className)} />;
    case "figma":
      return <FigmaIcon className={cn("w-5 h-5 text-neutral-main", className)} />;
    case "message-circle":
      return (
        <MessageCircle className={cn("w-5 h-5 text-primary-main", className)} />
      );
    case "youtube":
      return <YoutubeIcon className={cn("w-5 h-5 text-accent-main", className)} />;
    case "globe":
    default:
      return <Globe className={cn("w-5 h-5 text-primary-main", className)} />;
  }
}
