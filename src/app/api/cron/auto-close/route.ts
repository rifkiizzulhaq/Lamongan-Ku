import { NextResponse } from "next/server";
import { checkAndRunAutoClose } from "@/src/server/bos/laporan/auto-close.server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await checkAndRunAutoClose();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auto close cron error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
