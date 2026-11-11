import { z } from "zod";

export const createLinkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "링크 제목을 입력해 주세요.")
    .min(2, "링크 제목은 최소 2글자 이상 입력해 주세요.")
    .max(40, "링크 제목은 최대 40자까지 입력 가능합니다."),
  url: z
    .string()
    .trim()
    .min(1, "연결할 웹 주소(URL)를 입력해 주세요.")
    .refine((val) => !/\s/.test(val), "URL 주소에 공백이 포함될 수 없습니다.")
    .refine((val) => {
      let formatted = val;
      if (
        !formatted.startsWith("http://") &&
        !formatted.startsWith("https://") &&
        !formatted.startsWith("mailto:")
      ) {
        formatted = `https://${formatted}`;
      }
      try {
        const parsed = new URL(formatted);
        return ["http:", "https:", "mailto:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    }, "올바른 웹 주소 형식을 입력해 주세요. (예: https://example.com)")
    .refine((val) => {
      let formatted = val;
      if (
        !formatted.startsWith("http://") &&
        !formatted.startsWith("https://") &&
        !formatted.startsWith("mailto:")
      ) {
        formatted = `https://${formatted}`;
      }
      try {
        const parsed = new URL(formatted);
        if (parsed.protocol === "mailto:") return true;
        return parsed.hostname.includes(".") || parsed.hostname === "localhost";
      } catch {
        return false;
      }
    }, "올바른 도메인 주소를 입력해 주세요. (예: github.com)"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
