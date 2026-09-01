import {
  loadQuotations,
  getCurrentPendingFollowupRecords,
  readFollowupFormRecords,
} from "@/lib/services/googleSheetsService";
import {
  getTodayKey,
  getTomorrowKey,
  getTodayDisplay,
  toDateKeyFromDDMMYYYY,
  parseISTTimestamp,
  parseWonValue,
} from "./formatters.js";

export async function buildDailyReport() {
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const todayDisplay = getTodayDisplay();

  console.log("[Daily Email] Report generation started for", todayDisplay);

  const { quotations: allQuotations } = await loadQuotations();
  const allFollowupRecords = await readFollowupFormRecords();

  console.log("[Daily Email] Loaded", allQuotations.length, "quotations and", allFollowupRecords.length, "follow-up records");

  const todayQuotations = allQuotations.filter((q) => {
    const qKey = toDateKeyFromDDMMYYYY(q.quotationDate);
    return qKey === todayKey;
  });

  const totalQuotationsMadeToday = todayQuotations.length;
  const totalQuotationValue = todayQuotations.reduce(
    (sum, q) => sum + (Number(q.totalAmount) || 0),
    0
  );

  console.log("[Daily Email] Today's quotations:", totalQuotationsMadeToday);
  console.log("[Daily Email] Today's quotation value:", totalQuotationValue);

  const todayPendingFollowups = [];
  for (const record of allFollowupRecords) {
    if (String(record["Submission Type"] || "").trim() !== "Next Follow-up") continue;
    if (String(record["Followup Status"] || "").trim() !== "Pending") continue;
    const recordDateKey = toDateKeyFromDDMMYYYY(record["Next Followup Date"]);
    if (recordDateKey === todayKey) {
      const quotationNo = (record["Quotation No"] || "").trim();
      const quotation = allQuotations.find((q) => q.quotationNo === quotationNo);
      todayPendingFollowups.push({
        quotationNo,
        customerName: quotation?.customerName || record["Customer Name"] || "",
        location: "",
        nextFollowupDate: record["Next Followup Date"] || "",
        followupStatus: "Pending",
        followupRemark: record["Followup Remark"] || "",
        engineer: quotation?.engineer || "",
      });
    }
  }

  const totalFollowUpsToday = todayPendingFollowups.length;
  console.log("[Daily Email] Today's follow-ups:", totalFollowUpsToday);

  const todayWonOrders = [];
  const todayOtherStatus = [];

  for (const record of allFollowupRecords) {
    if (String(record["Submission Type"] || "").trim() !== "Order Status") continue;
    const tsDateKey = (() => {
      const ts = parseISTTimestamp(record.Timestamp || record.timestamp || "");
      if (!ts) return "";
      const istStr = ts.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      return istStr;
    })();
    if (tsDateKey !== todayKey) continue;

    const orderStatus = String(record["Order Status"] || "").trim();
    const quotationNo = (record["Quotation No"] || "").trim();
    const quotation = allQuotations.find((q) => q.quotationNo === quotationNo);

    if (orderStatus === "Won") {
      const wonValue = parseWonValue(record["Order won Value"]);
      todayWonOrders.push({
        quotationNo,
        customerName: quotation?.customerName || "",
        orderNumber: record["Order Number"] || "",
        orderStatus: "Won",
        orderWonValue: wonValue,
        orderReceivedDate: record["Order Received date"] || "",
        orderDate: record["Order Date"] || "",
        items: quotation
          ? (allQuotations.find((q) => q.quotationNo === quotationNo) || {}).items || []
          : [],
      });
    } else if (orderStatus) {
      todayOtherStatus.push({
        quotationNo,
        customerName: quotation?.customerName || "",
        orderStatus,
        orderNumber: record["Order Number"] || "",
        orderReceivedDate: record["Order Received date"] || "",
        engineer: quotation?.engineer || "",
      });
    }
  }

  const totalOrdersWonToday = todayWonOrders.length;
  const totalOrdersWonValue = todayWonOrders.reduce(
    (sum, o) => sum + o.orderWonValue,
    0
  );

  console.log("[Daily Email] Today's won orders:", totalOrdersWonToday);
  console.log("[Daily Email] Today's won value:", totalOrdersWonValue);

  const tomorrowPendingFollowups = [];
  for (const record of allFollowupRecords) {
    if (String(record["Submission Type"] || "").trim() !== "Next Follow-up") continue;
    if (String(record["Followup Status"] || "").trim() !== "Pending") continue;
    const recordDateKey = toDateKeyFromDDMMYYYY(record["Next Followup Date"]);
    if (recordDateKey === tomorrowKey) {
      const quotationNo = (record["Quotation No"] || "").trim();
      const quotation = allQuotations.find((q) => q.quotationNo === quotationNo);
      tomorrowPendingFollowups.push({
        quotationNo,
        customerName: quotation?.customerName || "",
        location: "",
        nextFollowupDate: record["Next Followup Date"] || "",
        followupStatus: "Pending",
        followupRemark: record["Followup Remark"] || "",
        engineer: quotation?.engineer || "",
        contactPerson: quotation?.customer?.contactPerson || "",
        contactNumber: quotation?.contactNumber || "",
        partNumber: "",
        partDescription: "",
      });
    }
  }

  return {
    todayKey,
    tomorrowKey,
    todayDisplay,
    totalFollowUpsToday,
    totalQuotationsMadeToday,
    totalQuotationValue,
    totalOrdersWonToday,
    totalOrdersWonValue,
    todayQuotations,
    todayPendingFollowups,
    todayWonOrders,
    todayOtherStatus,
    tomorrowPendingFollowups,
  };
}
