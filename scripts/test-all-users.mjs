/**
 * Test script — sends the redesigned Daily CRM Report to ALL active users.
 *
 * Each user receives a role-appropriate email:
 *   - User role  → User report (with "Dear <username>," greeting + Tomorrow's Follow-Ups)
 *   - Admin role → Admin report (no greeting, no Tomorrow's Follow-Ups section)
 *
 * Usage:
 *   node --import ./scripts/register-loader.mjs scripts/test-all-users.mjs
 */

process.loadEnvFile();

const { getUsers } = await import("@/lib/services/usersService.js");
const { buildDailyReport } = await import("@/lib/services/email/reportBuilder.js");
const { renderDailyReport } = await import("@/lib/services/email/templates/dailyReport.js");
const { renderUserFollowupsSection } = await import("@/lib/services/email/templates/userFollowups.js");
const { sendEmail } = await import("@/lib/services/email/transporter.js");

function tomorrowDisplayFromDateKey(k) {
  const p = k.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

function injectUserSection(html, userSectionHtml) {
  const footerSearch = "This is an automated report";
  const idx = html.indexOf(footerSearch);
  if (idx === -1) return html;
  let tdStart = idx;
  while (tdStart > 0 && html.substring(tdStart - 4, tdStart) !== "<td>") tdStart--;
  const searchBack = "<!-- Footer -->";
  let sectionStart = tdStart;
  while (sectionStart > 0 && html.substring(sectionStart - searchBack.length, sectionStart) !== searchBack) sectionStart--;
  if (sectionStart > 0) return html.substring(0, sectionStart) + userSectionHtml + "\n\n" + html.substring(sectionStart);
  const tableEnd = "</table></td></tr></table></body></html>";
  const tableEndIdx = html.lastIndexOf(tableEnd);
  if (tableEndIdx !== -1) return html.substring(0, tableEndIdx) + userSectionHtml + "\n" + tableEnd;
  return html;
}

async function main() {
  console.log("=== Daily CRM Report — Test Send to All Active Users ===\n");

  // 1. Get all users
  const users = await getUsers();
  const eligible = users.filter(
    (u) => u.active && u.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email.trim())
  );

  console.log("Eligible recipients:");
  for (let i = 0; i < eligible.length; i++) {
    const u = eligible[i];
    console.log("  " + (i + 1) + ". Username: " + u.username);
    console.log("     Role: " + (u.role || "(none)"));
    console.log("     Email: " + u.email.trim());
  }
  console.log("\nTotal eligible users: " + eligible.length);

  if (eligible.length === 0) {
    console.log("No eligible users found. Exiting.");
    process.exit(0);
  }

  // 2. Build report data once
  console.log("\nBuilding report from live Google Sheets data...");
  const reportData = await buildDailyReport();
  console.log("Report built:");
  console.log("  - Today:", reportData.todayDisplay);
  console.log("  - Quotations:", reportData.totalQuotationsMadeToday);
  console.log("  - Value:", reportData.totalQuotationValue);
  console.log("  - Follow-ups:", reportData.totalFollowUpsToday);
  console.log("  - Won orders:", reportData.totalOrdersWonToday);
  console.log("  - Won value:", reportData.totalOrdersWonValue);
  console.log("  - Tomorrow follow-ups:", reportData.tomorrowPendingFollowups.length);

  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  console.log("\nSender:", senderEmail);
  console.log("---");

  // 3. Send to each user
  let userSent = 0;
  let adminSent = 0;
  let failed = 0;

  for (const u of eligible) {
    const role = String(u.role || "").trim().toLowerCase();
    const isAdmin = role === "admin";
    const email = u.email.trim();

    console.log("\nSending to: " + u.username + " (" + email + ") — Role: " + (u.role || "none"));

    try {
      let html;

      if (isAdmin) {
        // Admin report — no greeting, no Tomorrow's Follow-Ups
        html = renderDailyReport(reportData);
      } else {
        // User report — greeting + Tomorrow's Follow-Ups
        html = renderDailyReport(reportData, "Dear " + u.username + ",");
        const userSection = renderUserFollowupsSection(
          reportData.tomorrowPendingFollowups,
          tomorrowDisplayFromDateKey(reportData.tomorrowKey)
        );
        html = injectUserSection(html, userSection);
      }

      await sendEmail({
        to: email,
        subject: "\uD83D\uDCCA Today Quotation Report",
        html: html,
      });

      console.log("  SUCCESS — sent to " + email);
      if (isAdmin) adminSent++; else userSent++;
    } catch (err) {
      console.error("  FAILED — " + err.message);
      failed++;
    }
  }

  // 4. Summary
  console.log("\n=== SUMMARY ===");
  console.log("Total eligible users: " + eligible.length);
  console.log("User emails sent: " + userSent);
  console.log("Admin emails sent: " + adminSent);
  console.log("Failed emails: " + failed);
  console.log("Sender: " + senderEmail + " (from SMTP_FROM)");
}

main();
