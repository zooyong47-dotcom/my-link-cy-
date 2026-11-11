import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { CustomLink } from "@/types/mylink";

// Firestore 링크 저장 경로: user/anonymous/links
const FIRESTORE_PATH = ["user", "anonymous", "links"] as const;

/**
 * GET /api/links
 * Firestore 'user/anonymous/links' 컬렉션의 링크 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledParam = searchParams.get("enabled");
    const query = searchParams.get("query")?.toLowerCase();
    const sort = searchParams.get("sort");

    const linksCol = collection(db, ...FIRESTORE_PATH);
    const snapshot = await getDocs(linksCol);

    let list: CustomLink[] = snapshot.docs.map((d) => {
      const data = d.data();
      const createdAtMillis =
        data.createdAt?.toMillis?.() ??
        (typeof data.createdAt === "number" ? data.createdAt : 0);

      return {
        id: d.id,
        title: data.title || "",
        subtitle: data.subtitle || undefined,
        url: data.url || "",
        badge: data.badge || undefined,
        icon: data.icon || "globe",
        enabled: data.enabled !== false,
        highlight: !!data.highlight,
        clicks: typeof data.clicks === "number" ? data.clicks : 0,
        createdAt: createdAtMillis,
      };
    });

    if (enabledParam !== null) {
      const isEnabled = enabledParam === "true";
      list = list.filter((item) => item.enabled === isEnabled);
    }

    if (query) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query))
      );
    }

    if (sort === "clicks") {
      list.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    } else if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // 기본 최신순 정렬 (내림차순)
      list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    const totalClicks = list.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

    return NextResponse.json({
      success: true,
      data: list,
      meta: {
        total: list.length,
        allCount: list.length,
        activeCount: list.filter((l) => l.enabled).length,
        totalClicks,
      },
    });
  } catch (error: any) {
    console.error("GET /api/links error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "링크 조회 실패" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/links
 * Firestore 'user/anonymous/links' 에 신규 링크 추가
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.url) {
      return NextResponse.json(
        { success: false, message: "title과 url 필드는 필수입니다." },
        { status: 400 }
      );
    }

    const docData: Record<string, any> = {
      title: body.title.trim(),
      url: body.url.trim(),
      icon: body.icon || "globe",
      highlight: !!body.highlight,
      enabled: body.enabled !== false,
      clicks: 0,
      createdAt: serverTimestamp(),
    };

    if (body.subtitle && typeof body.subtitle === "string" && body.subtitle.trim()) {
      docData.subtitle = body.subtitle.trim();
    }
    if (body.badge && typeof body.badge === "string" && body.badge.trim()) {
      docData.badge = body.badge.trim();
    }

    const linksCol = collection(db, ...FIRESTORE_PATH);
    const docRef = await addDoc(linksCol, docData);

    const newLink: CustomLink = {
      id: docRef.id,
      title: docData.title,
      subtitle: docData.subtitle,
      url: docData.url,
      badge: docData.badge,
      icon: docData.icon,
      enabled: docData.enabled,
      highlight: docData.highlight,
      clicks: 0,
      createdAt: Date.now(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "링크가 Firestore에 성공적으로 생성되었습니다.",
        data: newLink,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/links error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "링크 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/links
 * Firestore 'user/anonymous/links/{id}' 링크 수정 및 클릭수 증가
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id 필드가 필요합니다." },
        { status: 400 }
      );
    }

    const docRef = doc(db, FIRESTORE_PATH[0], FIRESTORE_PATH[1], FIRESTORE_PATH[2], id);

    if (action === "click") {
      await updateDoc(docRef, { clicks: increment(1) });
    } else {
      const sanitizedUpdates: Record<string, any> = {
        updateAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) {
          sanitizedUpdates[key] = val;
        }
      }
      await updateDoc(docRef, sanitizedUpdates);
    }

    return NextResponse.json({
      success: true,
      message: "링크가 수정되었습니다.",
    });
  } catch (error: any) {
    console.error("PATCH /api/links error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/links?id={linkId}
 * Firestore 'user/anonymous/links/{id}' 링크 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "삭제할 링크의 id 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const docRef = doc(db, FIRESTORE_PATH[0], FIRESTORE_PATH[1], FIRESTORE_PATH[2], id);
    await deleteDoc(docRef);

    return NextResponse.json({
      success: true,
      message: `ID '${id}' 링크가 성공적으로 삭제되었습니다.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/links error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "링크 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
