"use client";

import React from "react";
import { SocialLink } from "@/types/mylink";
import { Button } from "@/components/ui/button";
import {
  Mail,
  BookOpen,
  MessageSquare,
  Globe,
  AtSign,
} from "lucide-react";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  TwitterIcon,
  DiscordIcon,
} from "@/components/icons";

interface SocialIconsBarProps {
  socials: SocialLink[];
}

export function SocialIconsBar({ socials }: SocialIconsBarProps) {
  const activeSocials = socials.filter((s) => s.enabled);

  if (activeSocials.length === 0) return null;

  const renderIcon = (platform: SocialLink["platform"]) => {
    switch (platform) {
      case "github":
        return <GithubIcon className="w-4 h-4" />;
      case "youtube":
        return <YoutubeIcon className="w-4 h-4 text-accent-main" />;
      case "twitter":
        return <TwitterIcon className="w-4 h-4" />;
      case "instagram":
        return <InstagramIcon className="w-4 h-4" />;
      case "linkedin":
        return <LinkedinIcon className="w-4 h-4" />;
      case "discord":
        return <DiscordIcon className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "blog":
        return <BookOpen className="w-4 h-4" />;
      case "threads":
        return <AtSign className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
      {activeSocials.map((social) => (
        <Button
          key={social.id}
          variant="outline"
          size="iconSm"
          title={social.platform}
          className="w-10 h-10 rounded-[12px] border-neutral-weak2 bg-static-white text-neutral-main hover:bg-primary-weak hover:text-primary-main hover:border-primary-weak2 transition-all"
          render={
            <a
              href={social.url}
              target={social.url.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
            />
          }
        >
          {renderIcon(social.platform)}
        </Button>
      ))}
    </div>
  );
}
