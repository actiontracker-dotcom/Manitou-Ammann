import { createServer } from "http";
import { parse } from "url";
import next from "next";
import cron from "node-cron";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Preload Google Sheets caches in the background so the first user
  // request rarely blocks on cold sheet reads.  The server starts
  // listening immediately — preload never blocks startup.
  import("./src/lib/services/googleSheetsService.js")
    .then(({ preloadAll }) => {
      preloadAll()
        .then(() => {
          console.log("[server] All caches preloaded successfully");
        })
        .catch((err) => {
          console.warn("[server] Cache preload failed:", err.message);
        });
    })
    .catch((err) => {
      console.warn("[server] Cache preload module load failed:", err.message);
    });

  // ─── Daily Email Report Cron (8:00 PM IST) ────────────────────────────────────
  // Runs at 20:00 Asia/Kolkata every day. Uses the system timezone; if the server
  // is NOT in IST, set TZ=Asia/Kolkata in the environment. Vercel deployments
  // use vercel.json crons instead of this in-process scheduler.
  cron.schedule("0 20 * * *", async () => {
    console.log("[Cron] Daily email report triggered at", new Date().toISOString());
    try {
      const { sendDailyReportEmails } = await import("./src/lib/services/email/index.js");
      const results = await sendDailyReportEmails();
      console.log("[Cron] Daily email report completed:", JSON.stringify(results));
    } catch (err) {
      console.error("[Cron] Daily email report failed:", err);
    }
  }, {
    timezone: "Asia/Kolkata",
  });

  console.log("[server] Daily email cron scheduled: 8:00 PM IST");

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(
      `> Server ready on http://${hostname}:${port} (${dev ? "development" : "production"})`
    );
  });
});
