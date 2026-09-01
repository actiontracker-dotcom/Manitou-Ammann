const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const INR_FULL_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const IST_TIMEZONE = "Asia/Kolkata";

const IST_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const IST_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: IST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getTodayKey() {
  return IST_KEY_FORMATTER.format(new Date());
}

export function getTomorrowKey() {
  const now = new Date();
  const istNow = new Date(
    now.toLocaleString("en-US", { timeZone: IST_TIMEZONE })
  );
  istNow.setDate(istNow.getDate() + 1);
  return IST_KEY_FORMATTER.format(istNow);
}

export function getTodayDisplay() {
  return IST_DATE_FORMATTER.format(new Date());
}

export function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "\u20B90";
  return "\u20B9" + INR_FORMATTER.format(Math.round(n));
}

export function formatCurrencyFull(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "\u20B90.00";
  return "\u20B9" + INR_FULL_FORMATTER.format(n);
}

export function parseWonValue(raw) {
  if (raw === null || raw === undefined) return 0;
  const s = String(raw).trim();
  if (!s || s === "#N/A" || s === "#REF!" || s === "#VALUE!" || s === "#DIV/0!") return 0;
  const cleaned = s.replace(/[₹,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function toDateKeyFromDDMMYYYY(value) {
  if (!value) return "";
  const s = String(value).trim();
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return s;
    return "";
  }
  const [, d, m, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function parseISTTimestamp(value) {
  if (!value) return null;
  const s = String(value).trim();
  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, d, m, y, h, mi, se] = match.map(Number);
    return new Date(Date.UTC(y, m - 1, d, h - 5, mi - 30, se));
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatQuotationDate(value) {
  if (!value) return "\u2014";
  const s = String(value).trim();
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${d}/${m}/${y}`;
  }
  return s || "\u2014";
}
