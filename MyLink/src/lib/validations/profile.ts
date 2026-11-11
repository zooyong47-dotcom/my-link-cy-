import { z } from "zod";

export const RESERVED_USERNAMES = new Set([
  "guest",
  "admin",
  "administrator",
  "root",
  "system",
  "api",
  "mypage",
  "stats",
  "login",
  "logout",
  "settings",
  "profile",
  "null",
  "undefined",
]);

export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

export const usernameFieldSchema = z
  .string()
  .trim()
  .min(1, "username을 입력해 주세요.")
  .refine(
    (val) => normalizeUsername(val).length >= 2,
    "username은 최소 2자 이상 입력해 주세요."
  )
  .refine(
    (val) => normalizeUsername(val).length <= 24,
    "username은 최대 24자까지 입력 가능합니다."
  )
  .refine(
    (val) => /^[a-zA-Z0-9._-]+$/.test(normalizeUsername(val)),
    "영문, 숫자, 밑줄(_), 마침표(.), 하이픈(-)만 사용할 수 있습니다."
  )
  .refine(
    (val) => !RESERVED_USERNAMES.has(normalizeUsername(val).toLowerCase()),
    "사용할 수 없는 예약된 username입니다."
  );

export const updateProfileSchema = z.object({
  username: usernameFieldSchema,
  bio: z
    .string()
    .trim()
    .max(160, "소개글은 최대 160자까지 입력 가능합니다."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
