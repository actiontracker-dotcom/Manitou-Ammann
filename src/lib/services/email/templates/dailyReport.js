import { formatCurrency, formatQuotationDate } from "../formatters.js";

function esc(v) {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Dark dashboard color palette ─────────────────────────────────────────── */
var C = {
  pageBg: "#0f172a",
  containerBg: "#1e293b",
  cardBg: "#334155",
  accent: "#3b82f6",
  accentDark: "#2563eb",
  textPrimary: "#f1f5f9",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  border: "#475569",
  borderLight: "#334155",
  tableRow1: "#1e293b",
  tableRow2: "#273548",
  tableHeader: "#3b82f6",
  green: "#22c55e",
  greenBg: "#052e16",
  greenBorder: "#166534",
  red: "#ef4444",
  purple: "#a855f7",
  amber: "#f59e0b",
};

/* ── Reusable inline style strings ────────────────────────────────────────── */
function attr(style) {
  return " style=\"" + style + "\">";
}

function secHead(title) {
  return "<tr><td style=\"padding:20px 0 0 0;\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
    + "<tr><td style=\"background-color:" + C.accent + ";padding:10px 16px;border-radius:6px 6px 0 0;\">"
    + "<h2 style=\"margin:0;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.08em;\">"
    + esc(title) + "</h2></td></tr></table></td></tr>";
}

function emptyMsg(msg) {
  return "<tr><td style=\"padding:16px 20px;color:" + C.textMuted + ";font-size:13px;font-family:Arial,sans-serif;\">"
    + esc(msg) + "</td></tr>";
}

/* ── Quotation rows (5 columns only) ─────────────────────────────────────── */
function quotationRows(qs) {
  if (!qs || qs.length === 0) return emptyMsg("No quotations were created today.");

  var dash = "\u2014";
  var colW1 = "width=\"22%\"";
  var colW2 = "width=\"30%\"";
  var colW3 = "width=\"18%\"";
  var colW4 = "width=\"15%\"";
  var colW5 = "width=\"15%\"";

  var thL = "padding:10px 8px;text-align:left;font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;font-family:Arial,sans-serif;background-color:" + C.accent + ";";
  var thR = "padding:10px 8px;text-align:right;font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;font-family:Arial,sans-serif;background-color:" + C.accent + ";";
  var tdBold = "padding:10px 8px;font-size:12px;font-weight:600;color:" + C.textPrimary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";vertical-align:top;";
  var td = "padding:10px 8px;font-size:12px;color:" + C.textSecondary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";vertical-align:top;word-break:break-word;overflow-wrap:break-word;";
  var tdR = "padding:10px 8px;font-size:12px;font-weight:600;color:" + C.textPrimary + ";font-family:Arial,sans-serif;text-align:right;border-bottom:1px solid " + C.border + ";white-space:nowrap;vertical-align:top;";

  var rows = "";
  for (var qi = 0; qi < qs.length; qi++) {
    var q = qs[qi];
    var bg = qi % 2 === 0 ? C.tableRow1 : C.tableRow2;
    rows += "<tr style=\"background-color:" + bg + ";\">"
      + "<td" + attr(tdBold) + esc(q.quotationNo) + "</td>"
      + "<td" + attr(td) + esc(q.customerName) + "</td>"
      + "<td" + attr(td) + esc(q.contactNumber || dash) + "</td>"
      + "<td" + attr(td) + esc(q.division || dash) + "</td>"
      + "<td" + attr(tdR) + esc(formatCurrency(q.totalAmount)) + "</td>"
      + "</tr>";
  }

  return "<tr><td style=\"padding:0 0 8px 0;\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border:1px solid " + C.border + ";border-radius:6px;overflow:hidden;table-layout:fixed;\">"
    + "<colgroup>"
    + "<col " + colW1 + "/>"
    + "<col " + colW2 + "/>"
    + "<col " + colW3 + "/>"
    + "<col " + colW4 + "/>"
    + "<col " + colW5 + "/>"
    + "</colgroup>"
    + "<thead><tr>"
    + "<th" + attr(thL) + "Quotation No</th>"
    + "<th" + attr(thL) + "Customer</th>"
    + "<th" + attr(thL) + "Contact Number</th>"
    + "<th" + attr(thL) + "Division</th>"
    + "<th" + attr(thR) + "Total Amount</th>"
    + "</tr></thead><tbody>" + rows + "</tbody></table></td></tr>";
}

/* ── Follow-up rows ───────────────────────────────────────────────────────── */
function followupRows(fs) {
  if (!fs || fs.length === 0) return emptyMsg("No follow-ups scheduled for today.");

  var thL = "padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;font-family:Arial,sans-serif;background-color:" + C.accent + ";";
  var td = "padding:10px 14px;font-size:12px;color:" + C.textSecondary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";";
  var tdBold = "padding:10px 14px;font-size:12px;font-weight:600;color:" + C.textPrimary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";";

  var rows = "";
  for (var i = 0; i < fs.length; i++) {
    var f = fs[i];
    var bg = i % 2 === 0 ? C.tableRow1 : C.tableRow2;
    rows += "<tr style=\"background-color:" + bg + ";\">"
      + "<td" + attr(tdBold) + esc(f.quotationNo) + "</td>"
      + "<td" + attr(td) + esc(f.customerName) + "</td>"
      + "<td" + attr(td) + esc(f.location || "\u2014") + "</td>"
      + "<td" + attr(td) + esc(formatQuotationDate(f.nextFollowupDate)) + "</td>"
      + "<td" + attr(td) + esc(f.followupStatus) + "</td>"
      + "<td" + attr(td) + esc(f.followupRemark || "\u2014") + "</td></tr>";
  }

  return "<tr><td style=\"padding:0 0 8px 0;\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border:1px solid " + C.border + ";border-radius:6px;overflow:hidden;\">"
    + "<thead><tr>"
    + "<th" + attr(thL) + "Quotation No</th>"
    + "<th" + attr(thL) + "Customer</th>"
    + "<th" + attr(thL) + "Location</th>"
    + "<th" + attr(thL) + "Date</th>"
    + "<th" + attr(thL) + "Status</th>"
    + "<th" + attr(thL) + "Remark</th>"
    + "</tr></thead><tbody>" + rows + "</tbody></table></td></tr>";
}

/* ── Won order rows ───────────────────────────────────────────────────────── */
function wonRows(ws) {
  if (!ws || ws.length === 0) return emptyMsg("No orders were won today.");

  var thL = "padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;font-family:Arial,sans-serif;background-color:" + C.accent + ";";
  var thR = "padding:10px 14px;text-align:right;font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;font-family:Arial,sans-serif;background-color:" + C.accent + ";";
  var td = "padding:10px 14px;font-size:12px;color:" + C.textSecondary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";";
  var tdBold = "padding:10px 14px;font-size:12px;font-weight:600;color:" + C.textPrimary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";";
  var tdGreen = "padding:10px 14px;font-size:12px;font-weight:700;color:" + C.green + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";";
  var tdR = "padding:10px 14px;font-size:12px;font-weight:600;color:" + C.textPrimary + ";font-family:Arial,sans-serif;text-align:right;border-bottom:1px solid " + C.border + ";white-space:nowrap;";

  var rows = "";
  for (var i = 0; i < ws.length; i++) {
    var o = ws[i];
    var bg = i % 2 === 0 ? C.tableRow1 : C.tableRow2;
    rows += "<tr style=\"background-color:" + bg + ";\">"
      + "<td" + attr(tdBold) + esc(o.quotationNo) + "</td>"
      + "<td" + attr(td) + esc(o.customerName) + "</td>"
      + "<td" + attr(td) + esc(o.orderNumber || "\u2014") + "</td>"
      + "<td" + attr(tdGreen) + "Won</td>"
      + "<td" + attr(tdR) + esc(formatCurrency(o.orderWonValue)) + "</td>"
      + "</tr>";
  }

  return "<tr><td style=\"padding:0 0 8px 0;\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border:1px solid " + C.border + ";border-radius:6px;overflow:hidden;\">"
    + "<thead><tr>"
    + "<th" + attr(thL) + "Quotation No</th>"
    + "<th" + attr(thL) + "Customer</th>"
    + "<th" + attr(thL) + "Order No</th>"
    + "<th" + attr(thL) + "Status</th>"
    + "<th" + attr(thR) + "Won Value</th>"
    + "</tr></thead><tbody>" + rows + "</tbody></table></td></tr>";
}

/* ── Other order status rows ─────────────────────────────────────────────── */
function otherRows(ss) {
  if (!ss || ss.length === 0) return emptyMsg("No other order status activity today.");

  var thL = "padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;font-family:Arial,sans-serif;background-color:" + C.accent + ";";
  var td = "padding:10px 14px;font-size:12px;color:" + C.textSecondary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";";
  var tdBold = "padding:10px 14px;font-size:12px;font-weight:600;color:" + C.textPrimary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";";

  var rows = "";
  for (var i = 0; i < ss.length; i++) {
    var s = ss[i];
    var bg = i % 2 === 0 ? C.tableRow1 : C.tableRow2;
    var sc = s.orderStatus === "Loss" ? C.red : s.orderStatus === "Dead" ? C.purple : s.orderStatus === "Partial" ? C.amber : C.textMuted;
    rows += "<tr style=\"background-color:" + bg + ";\">"
      + "<td" + attr(tdBold) + esc(s.quotationNo) + "</td>"
      + "<td" + attr(td) + esc(s.customerName) + "</td>"
      + "<td style=\"padding:10px 14px;font-size:12px;font-weight:700;color:" + sc + ";font-family:Arial,sans-serif;border-bottom:1px solid " + C.border + ";\">" + esc(s.orderStatus) + "</td>"
      + "<td" + attr(td) + esc(s.orderNumber || "\u2014") + "</td></tr>";
  }

  return "<tr><td style=\"padding:0 0 8px 0;\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border:1px solid " + C.border + ";border-radius:6px;overflow:hidden;\">"
    + "<thead><tr>"
    + "<th" + attr(thL) + "Quotation No</th>"
    + "<th" + attr(thL) + "Customer</th>"
    + "<th" + attr(thL) + "Status</th>"
    + "<th" + attr(thL) + "Order No</th>"
    + "</tr></thead><tbody>" + rows + "</tbody></table></td></tr>";
}

/* ── Main render function ─────────────────────────────────────────────────── */
export function renderDailyReport(data, greeting) {
  var d = esc(data.todayDisplay);

  var greetingHtml = greeting
    ? '<tr><td style="padding:0 0 16px 0;"><p style="margin:0;font-size:15px;color:' + C.textPrimary + ';font-family:Arial,sans-serif;font-weight:600;">' + esc(greeting) + "</p></td></tr>"
    : "";

  /* KPI card row */
  var kpiCard = function (label, value, color) {
    return '<td width="20%" valign="top" style="padding:0 4px;">'
      + '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:' + C.cardBg + ";border:1px solid " + C.border + ';border-radius:6px;">'
      + '<tr><td style="padding:12px 10px;text-align:center;">'
      + '<p style="margin:0 0 4px;font-size:9px;font-weight:700;color:' + C.textMuted + ";font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.08em;\">" + esc(label) + "</p>"
      + '<p style="margin:0;font-size:18px;font-weight:700;color:' + (color || C.textPrimary) + ";font-family:Arial,sans-serif;\">" + value + "</p>"
      + "</td></tr></table></td>";
  };

  var kpiRow = "<tr><td style=\"padding:0 0 8px 0;\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>"
    + kpiCard("Follow Ups", data.totalFollowUpsToday, C.textPrimary)
    + kpiCard("Quotations", data.totalQuotationsMadeToday + " Nos.", C.accent)
    + kpiCard("Quotation Value", esc(formatCurrency(data.totalQuotationValue)), C.green)
    + kpiCard("Orders Won", data.totalOrdersWonToday, C.textPrimary)
    + kpiCard("Won Value", esc(formatCurrency(data.totalOrdersWonValue)), C.green)
    + "</tr></table></td></tr>";

  /* Footer — must contain "This is an automated report" for injectUserSection() */
  var footer = "<!-- Footer -->"
    + "<tr><td style=\"padding:20px 0 0 0;border-top:1px solid " + C.border + ";\">"
    + "<p style=\"margin:0;font-size:10px;color:" + C.textMuted + ";font-family:Arial,sans-serif;text-align:center;\">"
    + "This is an automated report from DEEPSIKHA ENTERPRISES CRM System.<br/>Generated at " + d + " 8:00 PM IST.</p>"
    + "</td></tr>";

  return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/><title>Today Quotation Report</title></head>"
    + "<body style=\"margin:0;padding:0;background-color:" + C.pageBg + ";font-family:Arial,sans-serif;\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:" + C.pageBg + ";\"><tr><td align=\"center\" style=\"padding:24px 12px;\">"

    /* Main container */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:680px;background-color:" + C.containerBg + ";border-radius:8px;border:1px solid " + C.border + ";\">"

    /* ── Header ── */
    + "<tr><td style=\"padding:24px 24px 16px;background-color:" + C.containerBg + ";border-bottom:2px solid " + C.accent + ";\">"
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>"
    + "<td valign=\"middle\">"
    + '<p style="margin:0;font-size:11px;font-weight:700;color:' + C.accent + ";font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.1em;\">DEEPSIKHA ENTERPRISES</p>"
    + '<p style="margin:4px 0 0;font-size:18px;font-weight:700;color:' + C.textPrimary + ";font-family:Arial,sans-serif;\">Daily Quotation Report</p>"
    + '<p style="margin:2px 0 0;font-size:12px;color:' + C.textMuted + ";font-family:Arial,sans-serif;\">Daily CRM Performance Summary</p>"
    + "</td>"
    + '<td valign=\"middle\" align=\"right\">'
    + '<p style="margin:0;font-size:12px;color:' + C.textMuted + ";font-family:Arial,sans-serif;\">Date</p>"
    + '<p style="margin:2px 0 0;font-size:14px;font-weight:700;color:' + C.textPrimary + ";font-family:Arial,sans-serif;\">" + d + "</p>"
    + "</td></tr></table></td></tr>"

    /* ── Body ── */
    + "<tr><td style=\"padding:20px 24px;\">"

    /* Greeting */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">" + greetingHtml + "</table>"

    /* KPI Cards */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">" + kpiRow + "</table>"

    /* Today's Quotations */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
    + secHead("Today's Quotations")
    + quotationRows(data.todayQuotations)
    + "</table>"

    /* Today's Follow-Ups */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
    + secHead("Today's Follow-Ups")
    + followupRows(data.todayPendingFollowups)
    + "</table>"

    /* Today's Won Orders */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
    + secHead("Today's Won Orders")
    + wonRows(data.todayWonOrders)
    + "</table>"

    /* Other Order Status Activity */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
    + secHead("Other Order Status Activity")
    + otherRows(data.todayOtherStatus)
    + "</table>"

    /* Footer */
    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">" + footer + "</table>"

    + "</td></tr>"
    + "</table>"
    + "</td></tr></table></body></html>";
}
