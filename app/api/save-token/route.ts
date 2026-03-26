import { NextResponse } from "next/server";
import { saveMessagingToken } from "@/firebase/firestore";

export async function POST(req: Request) {
  const { token, userEmail } = (await req.json()) as {
    token?: string;
    userEmail?: string;
  };

  if (!token || !userEmail) {
    return NextResponse.json({ error: "Missing token or userEmail." }, { status: 400 });
  }

  if (userEmail === "admin") {
    return NextResponse.json({ success: true, skipped: true });
  }

  await saveMessagingToken({
    token,
    userEmail,
    role: "user",
  });

  return NextResponse.json({ success: true });
}
