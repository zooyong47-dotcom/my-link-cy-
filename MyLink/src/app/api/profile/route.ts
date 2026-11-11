import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROFILE, SAMPLE_PROFILES } from "@/data/mockData";
import { MyLinkProfile } from "@/types/mylink";

// 서버 메모리 상의 임시 프로필 저장소
let profileDb: Record<string, MyLinkProfile> = {
  shinyong: { ...MOCK_PROFILE },
  ...SAMPLE_PROFILES,
};

/**
 * GET /api/profile
 * 프로필 조회 API
 *
 * Query Params:
 * - username: string (기본값: 'shinyong')
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "shinyong";

  const profile = profileDb[username];

  if (!profile) {
    return NextResponse.json(
      {
        success: false,
        message: `사용자 '${username}'의 프로필을 찾을 수 없습니다.`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: profile,
  });
}

/**
 * PUT /api/profile
 * 프로필 정보 수정 API
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username || "shinyong";

    if (!profileDb[username]) {
      return NextResponse.json(
        {
          success: false,
          message: `사용자 '${username}'의 프로필을 찾을 수 없습니다.`,
        },
        { status: 404 }
      );
    }

    profileDb[username] = {
      ...profileDb[username],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "프로필 정보가 성공적으로 업데이트되었습니다.",
      data: profileDb[username],
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "요청 본문 처리 중 오류가 발생했습니다." },
      { status: 400 }
    );
  }
}
