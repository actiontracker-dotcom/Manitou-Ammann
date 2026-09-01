import { sendEmail } from "./transporter.js";
import { getAdminEmails, getUserEmail, isTestMode } from "./recipients.js";
import { buildDailyReport } from "./reportBuilder.js";
import { getTestData } from "./testData.js";
import { renderDailyReport } from "./templates/dailyReport.js";
import { renderUserFollowupsSection } from "./templates/userFollowups.js";

export { getAdminEmails, getUserEmail, isTestMode } from "./recipients.js";
export { buildDailyReport } from "./reportBuilder.js";

function tomorrowDisplayFromDateKey(tomorrowKey) {
  var parts = tomorrowKey.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function injectUserSection(html, userSectionHtml) {
  var footerSearch = "This is an automated report";
  var idx = html.indexOf(footerSearch);
  if (idx === -1) return html;

  var tdStart = idx;
  while (tdStart > 0 && html.substring(tdStart - 4, tdStart) !== "<td>") {
    tdStart--;
  }
  var searchBack = "<!-- Footer -->";
  var sectionStart = tdStart;
  while (sectionStart > 0 && html.substring(sectionStart - searchBack.length, sectionStart) !== searchBack) {
    sectionStart--;
  }
  if (sectionStart > 0) {
    return html.substring(0, sectionStart) + userSectionHtml + "\n\n" + html.substring(sectionStart);
  }

  var tableEnd = "</table></td></tr></table></body></html>";
  var tableEndIdx = html.lastIndexOf(tableEnd);
  if (tableEndIdx !== -1) {
    return html.substring(0, tableEndIdx) + userSectionHtml + "\n" + tableEnd;
  }

  return html;
}

export async function sendDailyReportEmails(username) {
  var reportData = isTestMode() ? getTestData() : await buildDailyReport();

  console.log("[Daily Email] Report data ready. Test mode:", isTestMode());
  console.log("[Daily Email] Today's quotations:", reportData.totalQuotationsMadeToday);
  console.log("[Daily Email] Today's follow-ups:", reportData.totalFollowUpsToday);
  console.log("[Daily Email] Today's won orders:", reportData.totalOrdersWonToday);
  console.log("[Daily Email] Today's won value:", reportData.totalOrdersWonValue);

  var results = { admin: null, users: [] };

  var adminEmails = await getAdminEmails();
  if (adminEmails.length > 0) {
    var adminHtml = renderDailyReport(reportData);
    try {
      await sendEmail({
        to: adminEmails.join(", "),
        subject: "\uD83D\uDCCA Today Quotation Report",
        html: adminHtml,
      });
      console.log("[Daily Email] Admin email sent to:", adminEmails.join(", "));
      results.admin = { success: true, recipients: adminEmails };
    } catch (err) {
      console.error("[Daily Email] Admin email failed:", err.message);
      results.admin = { success: false, error: err.message, recipients: adminEmails };
    }
  } else {
    console.log("[Daily Email] No admin recipients found. Skipping admin email.");
  }

  if (username) {
    var userEmail = await getUserEmail(username);
    if (userEmail) {
      var userHtml = renderDailyReport(reportData, "Dear " + username + ",");
      var userSection = renderUserFollowupsSection(
        reportData.tomorrowPendingFollowups,
        tomorrowDisplayFromDateKey(reportData.tomorrowKey)
      );
      var fullUserHtml = injectUserSection(userHtml, userSection);

      try {
        await sendEmail({
          to: userEmail,
          subject: "\uD83D\uDCCA Today Quotation Report",
          html: fullUserHtml,
        });
        console.log("[Daily Email] User email sent to:", userEmail);
        results.users.push({ success: true, recipients: [userEmail] });
      } catch (err) {
        console.error("[Daily Email] User email failed:", err.message);
        results.users.push({ success: false, error: err.message, recipients: [userEmail] });
      }
    } else {
      console.log("[Daily Email] No valid email for user:", username, ". Skipping user email.");
    }
  }

  return results;
}
