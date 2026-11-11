export interface SocialLink {
  id: string;
  platform: 'instagram' | 'youtube' | 'github' | 'twitter' | 'tiktok' | 'threads' | 'email' | 'blog' | 'linkedin' | 'discord';
  url: string;
  enabled: boolean;
}

export interface CustomLink {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  badge?: string;
  category?: string;
  enabled: boolean;
  highlight?: boolean;
  clicks?: number;
  icon?: string;
  bgColor?: string;
  badgeColor?: string;
  createdAt?: number | any;
  updateAt?: number | any;
  updatedAt?: number | any;
}

export interface ThemeConfig {
  presetId: string;
  name?: string;
  backgroundClass: string;
  textColor: string;
  subTextColor?: string;
  cardBg: string;
  cardBorder: string;
  buttonStyle: 'rounded' | 'pill' | 'sharp' | 'outline' | 'shadow' | 'glass';
  buttonBg: string;
  buttonText: string;
  buttonBorder?: string;
  buttonShadow?: string;
  accentColor: string;
}

export interface MyLinkProfile {
  username: string;
  displayName: string;
  englishName?: string;
  role?: string;
  bio: string;
  avatarUrl: string;
  badge?: string;
  location?: string;
  email?: string;
  school?: string;
  theme: ThemeConfig;
  socials: SocialLink[];
  links: CustomLink[];
  updatedAt?: string;
}
