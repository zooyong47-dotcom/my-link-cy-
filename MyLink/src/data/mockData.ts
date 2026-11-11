import { CustomLink, MyLinkProfile, SocialLink, ThemeConfig } from "@/types/mylink";

/**
 * 🔗 기본 링크 목록 더미 데이터 (CustomLink[])
 */
export const MOCK_CUSTOM_LINKS: CustomLink[] = [
  {
    id: "link-1",
    title: "🚀 개인 포트폴리오 웹사이트",
    subtitle: "React & Next.js 기반 최신 프로젝트 및 인터랙티브 쇼케이스",
    url: "https://portfolio.example.com",
    enabled: true,
    highlight: true,
    clicks: 1240,
    icon: "globe",
  },
  {
    id: "link-2",
    title: "💻 GitHub 저장소",
    subtitle: "오픈소스 기여 및 프론트엔드/백엔드 토이 프로젝트 소스코드",
    url: "https://github.com",
    enabled: true,
    highlight: false,
    clicks: 856,
    icon: "github",
  },
  {
    id: "link-3",
    title: "📝 기술 블로그 (Velog / Tistory)",
    subtitle: "프론트엔드 최적화, 트러블슈팅, 신기술 스터디 기록",
    url: "https://velog.io",
    enabled: true,
    highlight: false,
    clicks: 642,
    icon: "book-open",
  },
  {
    id: "link-4",
    title: "📄 이력서 & 경력 기술서 (Notion)",
    subtitle: "상세 이력, 프로젝트 경험, 자격증 및 학력 사항 정리",
    url: "https://notion.so",
    enabled: true,
    highlight: true,
    clicks: 430,
    icon: "file-text",
  },
  {
    id: "link-5",
    title: "🎨 Figma 디자인 시스템 & UI 킷",
    subtitle: "네오브루탈리즘 & 미니멀 모던 UI/UX 디자인 컴포넌트",
    url: "https://figma.com",
    enabled: true,
    highlight: false,
    clicks: 312,
    icon: "figma",
  },
  {
    id: "link-6",
    title: "💬 1:1 커피챗 & 멘토링 오픈카톡",
    subtitle: "프로젝트 협업 제안 및 주니어 개발자 진로 상담",
    url: "https://open.kakao.com",
    enabled: true,
    highlight: false,
    clicks: 198,
    icon: "message-circle",
  },
  {
    id: "link-7",
    title: "🎬 개발 유튜브 채널",
    subtitle: "코딩 라이브, 알고리즘 풀이 및 웹 개발 팁 영상",
    url: "https://youtube.com",
    enabled: false,
    highlight: false,
    clicks: 95,
    icon: "youtube",
  },
];

/**
 * 🌐 소셜 링크 더미 데이터 (SocialLink[])
 */
export const MOCK_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "social-github",
    platform: "github",
    url: "https://github.com",
    enabled: true,
  },
  {
    id: "social-blog",
    platform: "blog",
    url: "https://velog.io",
    enabled: true,
  },
  {
    id: "social-linkedin",
    platform: "linkedin",
    url: "https://linkedin.com",
    enabled: true,
  },
  {
    id: "social-instagram",
    platform: "instagram",
    url: "https://instagram.com",
    enabled: true,
  },
  {
    id: "social-email",
    platform: "email",
    url: "mailto:chanyong.dev@gmail.com",
    enabled: true,
  },
  {
    id: "social-discord",
    platform: "discord",
    url: "https://discord.gg",
    enabled: false,
  },
  {
    id: "social-youtube",
    platform: "youtube",
    url: "https://youtube.com",
    enabled: false,
  },
];

/**
 * 🎨 기본 테마 설정 더미 데이터
 */
export const DEFAULT_THEME: ThemeConfig = {
  presetId: "neobrutalism-yellow",
  name: "네오브루탈리즘 옐로우",
  backgroundClass: "bg-[#FFFDF0]",
  textColor: "#000000",
  subTextColor: "#4B5563",
  cardBg: "#FFFFFF",
  cardBorder: "#000000",
  buttonStyle: "shadow",
  buttonBg: "#FFE169",
  buttonText: "#000000",
  buttonBorder: "#000000",
  buttonShadow: "#000000",
  accentColor: "#67E8F9",
};

/**
 * 👤 기본 마이링크 프로필 더미 데이터 (MyLinkProfile)
 */
export const MOCK_PROFILE: MyLinkProfile = {
  username: "shinyong",
  displayName: "신찬용",
  bio: "⚡ 우아하고 직관적인 코드로 문제를 해결하는 개발자\n새로운 웹 기술을 탐구하고 직관적인 사용자 경험을 구현하는 것을 좋아합니다 🚀",
  avatarUrl: "/avatar.svg",
  badge: "STUDENT DEVELOPER",
  theme: DEFAULT_THEME,
  socials: MOCK_SOCIAL_LINKS,
  links: MOCK_CUSTOM_LINKS,
  updatedAt: new Date().toISOString(),
};

/**
 * 📦 직군/스타일별 다양한 샘플 링크 및 프로필 세트
 */
export const SAMPLE_PROFILES: Record<string, MyLinkProfile> = {
  developer: MOCK_PROFILE,
  creator: {
    username: "creator_studio",
    displayName: "스튜디오 크리에이티브",
    bio: "일상과 테크를 영상으로 기록합니다 📸 매주 화/금 신규 콘텐츠 업로드!",
    avatarUrl: "/avatar.svg",
    badge: "CONTENT CREATOR",
    theme: {
      presetId: "creator-pink",
      name: "파스텔 핑크",
      backgroundClass: "bg-pink-50",
      textColor: "#1F2937",
      subTextColor: "#6B7280",
      cardBg: "#FFFFFF",
      cardBorder: "#F472B6",
      buttonStyle: "pill",
      buttonBg: "#F472B6",
      buttonText: "#FFFFFF",
      accentColor: "#FB7185",
    },
    socials: [
      { id: "s-yt", platform: "youtube", url: "https://youtube.com", enabled: true },
      { id: "s-ig", platform: "instagram", url: "https://instagram.com", enabled: true },
      { id: "s-tt", platform: "tiktok", url: "https://tiktok.com", enabled: true },
      { id: "s-mail", platform: "email", url: "mailto:creator@example.com", enabled: true },
    ],
    links: [
      {
        id: "c-1",
        title: "🎬 [최신영상] 2026 데스크 셋업 & 개발자 룸투어",
        subtitle: "생산성을 200% 올려주는 잇템 모음!",
        url: "https://youtube.com",
        enabled: true,
        highlight: true,
        clicks: 3420,
      },
      {
        id: "c-2",
        title: "🛍️ 영상 속 추천 장비 & 할인 링크 모음",
        subtitle: "모니터암, 키보드, 조명 최저가 구매 링크",
        url: "https://example.com/gear",
        enabled: true,
        highlight: false,
        clicks: 1840,
      },
      {
        id: "c-3",
        title: "☕ 팬 커뮤니티 & 오픈 채팅방",
        subtitle: "크리에이터와의 실시간 소통 및 비하인드 컷",
        url: "https://open.kakao.com",
        enabled: true,
        highlight: false,
        clicks: 890,
      },
      {
        id: "c-4",
        title: "📬 비즈니스 / 광고 협찬 문의",
        subtitle: "브랜디드 콘텐츠 및 제휴 제안",
        url: "mailto:business@example.com",
        enabled: true,
        highlight: false,
        clicks: 420,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  designer: {
    username: "design_craft",
    displayName: "김디자인",
    bio: "사용자의 감성을 터치하는 인터랙티브 UI/UX 디자이너 🌿",
    avatarUrl: "/avatar.svg",
    badge: "PRODUCT DESIGNER",
    theme: {
      presetId: "minimal-dark",
      name: "미니멀 다크",
      backgroundClass: "bg-zinc-950",
      textColor: "#FAFAFA",
      subTextColor: "#A1A1AA",
      cardBg: "#18181B",
      cardBorder: "#27272A",
      buttonStyle: "rounded",
      buttonBg: "#27272A",
      buttonText: "#FAFAFA",
      accentColor: "#38BDF8",
    },
    socials: [
      { id: "d-ig", platform: "instagram", url: "https://instagram.com", enabled: true },
      { id: "d-li", platform: "linkedin", url: "https://linkedin.com", enabled: true },
      { id: "d-mail", platform: "email", url: "mailto:designer@example.com", enabled: true },
    ],
    links: [
      {
        id: "d-1",
        title: "💎 2026 UI/UX 디자인 포트폴리오 (Behance)",
        subtitle: "모바일 앱, 웹 서비스 디자인 케이스 스터디",
        url: "https://behance.net",
        enabled: true,
        highlight: true,
        clicks: 2150,
      },
      {
        id: "d-2",
        title: "🧩 무료 UI 디자인 시스템 키트 다운로드",
        subtitle: "Figma Community에서 무료 배포 중인 컴포넌트 팩",
        url: "https://figma.com/@design_craft",
        enabled: true,
        highlight: false,
        clicks: 1420,
      },
      {
        id: "d-3",
        title: "✍️ 디자인 아티클 (Brunch / Medium)",
        subtitle: "디자인 시스템 구축기와 사용자 경험 UX 리서치 노하우",
        url: "https://medium.com",
        enabled: true,
        highlight: false,
        clicks: 650,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
};
