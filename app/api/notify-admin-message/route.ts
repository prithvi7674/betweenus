import { NextResponse } from "next/server";
import { getFirebaseAdminDb, getFirebaseAdminMessaging } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    const { title, body } = (await request.json()) as {
      title?: string;
      body?: string;
    };

    if (!title || !body) {
      return NextResponse.json(
        { error: "Missing title or body." },
        { status: 400 },
      );
    }

    const adminDb = getFirebaseAdminDb();
    const adminMessaging = getFirebaseAdminMessaging();

    if (!adminDb || !adminMessaging) {
      return NextResponse.json({ sent: 0, skipped: true });
    }

    const snapshot = await adminDb
      .collection("tokens")
      .where("role", "==", "user")
      .get();
    const tokens = snapshot.docs
      .map((docItem) => docItem.data().token)
      .filter((token): token is string => typeof token === "string");

    if (tokens.length === 0) {
      return NextResponse.json({ sent: 0, skipped: true });
    }

    const response = await adminMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          title,
          body,
          icon: "/favicon.ico",
        },
      },
    });

    return NextResponse.json({
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (error) {
    console.error("Failed to send admin push notification", error);
    return NextResponse.json(
      { error: "Failed to send notification." },
      { status: 500 },
    );
  }
}
