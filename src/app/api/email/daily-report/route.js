import { NextResponse } from "next/server";
import { sendDailyReportEmails } from "@/lib/services/email";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    console.log("[Cron] Daily email report triggered");
    const results = await sendDailyReportEmails();
    console.log("[Cron] Daily email report completed:", JSON.stringify(results));

    return NextResponse.json({
      success: true,
      message: "Daily report sent.",
      results,
    });
  } catch (error) {
    console.error("[Cron] Daily email report failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send daily report.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
