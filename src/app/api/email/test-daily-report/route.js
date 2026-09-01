import { NextResponse } from "next/server";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth/session";
import { sendDailyReportEmails } from "@/lib/services/email";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    console.log("[Email Test] Manual test triggered by:", user.username);
    const results = await sendDailyReportEmails(user.username);
    console.log("[Email Test] Results:", JSON.stringify(results));

    return NextResponse.json({
      success: true,
      message: "Daily report emails sent successfully.",
      results,
    });
  } catch (error) {
    console.error("[Email Test] Failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send daily report emails.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const { buildDailyReport } = await import("@/lib/services/email");
    const reportData = await buildDailyReport();

    return NextResponse.json({
      success: true,
      message: "Report data built successfully (no emails sent).",
      data: {
        todayDisplay: reportData.todayDisplay,
        totalFollowUpsToday: reportData.totalFollowUpsToday,
        totalQuotationsMadeToday: reportData.totalQuotationsMadeToday,
        totalQuotationValue: reportData.totalQuotationValue,
        totalOrdersWonToday: reportData.totalOrdersWonToday,
        totalOrdersWonValue: reportData.totalOrdersWonValue,
        quotationsCount: reportData.todayQuotations.length,
        followupsCount: reportData.todayPendingFollowups.length,
        wonOrdersCount: reportData.todayWonOrders.length,
        otherStatusCount: reportData.todayOtherStatus.length,
        tomorrowFollowupsCount: reportData.tomorrowPendingFollowups.length,
      },
    });
  } catch (error) {
    console.error("[Email Test] Report build failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to build report data.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
