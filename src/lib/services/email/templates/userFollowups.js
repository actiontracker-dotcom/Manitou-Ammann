import { formatQuotationDate } from "../formatters.js";

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var accent = "#3b82f6";
var border = "#475569";
var textPrimary = "#f1f5f9";
var textSecondary = "#cbd5e1";
var textMuted = "#94a3b8";
var tableRow1 = "#1e293b";
var tableRow2 = "#273548";

function attr(style) {
  return " style=\"" + style + "\">";
}

export function renderUserFollowupsSection(followups, tomorrowDisplay) {
  var heading = '<tr><td style="padding:20px 0 0 0;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="background-color:' + accent + ";padding:10px 16px;border-radius:6px 6px 0 0;\">"
    + '<h2 style="margin:0;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.08em;">Tomorrow\'s Follow-Ups</h2>'
    + '<p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.7);font-family:Arial,sans-serif;">' + esc(tomorrowDisplay) + "</p>"
    + "</td></tr></table></td></tr>";

  if (!followups || followups.length === 0) {
    return heading + '<tr><td style="padding:12px 16px;color:' + textMuted + ';font-size:13px;font-family:Arial,sans-serif;border:1px solid ' + border + ";border-top:none;border-radius:0 0 6px 6px;\">No follow-ups scheduled for " + esc(tomorrowDisplay) + ".</td></tr>";
  }

  var thL = "padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;font-family:Arial,sans-serif;background-color:" + accent + ";";
  var td = "padding:10px 14px;font-size:12px;color:" + textSecondary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + border + ";";
  var tdBold = "padding:10px 14px;font-size:12px;font-weight:600;color:" + textPrimary + ";font-family:Arial,sans-serif;border-bottom:1px solid " + border + ";";

  var rows = "";
  for (var i = 0; i < followups.length; i++) {
    var f = followups[i];
    var bg = i % 2 === 0 ? tableRow1 : tableRow2;
    rows += '<tr style="background-color:' + bg + ';">'
      + '<td style="' + tdBold + '">' + esc(f.quotationNo) + "</td>"
      + '<td style="' + td + '">' + esc(f.customerName) + "</td>"
      + '<td style="' + td + '">' + esc(f.location || "\u2014") + "</td>"
      + '<td style="' + td + '">' + esc(f.partNumber || "\u2014") + "</td>"
      + '<td style="' + td + '">' + esc(f.partDescription || "\u2014") + "</td>"
      + '<td style="' + td + '">' + esc(formatQuotationDate(f.nextFollowupDate)) + "</td>"
      + '<td style="' + td + '">' + esc(f.followupRemark || "\u2014") + "</td>"
      + '<td style="' + td + '">' + esc(f.contactPerson || "\u2014") + "</td>"
      + '<td style="' + td + '">' + esc(f.contactNumber || "\u2014") + "</td></tr>";
  }

  var table = '<tr><td style="padding:0 0 8px 0;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ' + border + ';border-radius:6px;overflow:hidden;border-top:none;table-layout:fixed;">'
    + '<thead><tr>'
    + '<th style="' + thL + '">Quotation No</th>'
    + '<th style="' + thL + '">Customer</th>'
    + '<th style="' + thL + '">Location</th>'
    + '<th style="' + thL + '">Part No</th>'
    + '<th style="' + thL + '">Description</th>'
    + '<th style="' + thL + '">Date</th>'
    + '<th style="' + thL + '">Remark</th>'
    + '<th style="' + thL + '">Contact</th>'
    + '<th style="' + thL + '">Phone</th>'
    + "</tr></thead><tbody>" + rows + "</tbody></table></td></tr>";

  return heading + table;
}
