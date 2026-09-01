import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { validateQuotation } from "@/lib/validation/quotationSchema";
import { appendQuotation, getQuotations, generateNextQuotationNumber } from "@/lib/services/googleSheetsService";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth/session";
import { computeQuotationTotals } from "@/lib/utils/formatters";
import { normalizeToCanonicalDate } from "@/lib/utils/dateUtils";

// This route handles both listing and creating quotations.
// The frontend always calls this endpoint; it never touches the sheet directly.

// Never statically optimize or cache this route. Every GET reads the Google
// Sheet live (see loadQuotations in googleSheetsService), and every response
// is explicitly marked no-store so no serverless instance, CDN, or browser
// ever serves a stale quotation list.
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

function clamp(val, min, max) {
  const n = Number(val);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function parseDate(value) {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, y, m, d] = iso.map(Number);
    return new Date(y, m - 1, d);
  }

  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy.map(Number);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const parsed = new Date(y, m - 1, d);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  }

  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination params
    const page = clamp(searchParams.get("page"), 1, 10000);
    const pageSize = clamp(searchParams.get("pageSize"), 1, 100);

    // Filter params
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const orderStatus = searchParams.get("orderStatus") || "All";
    const caseStatus = searchParams.get("caseStatus") || "All";
    const division = searchParams.get("division") || "All";
    const dateWise = searchParams.get("dateWise") || "All";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    // Fetch all quotations (server-side cache handles Google Sheets read)
    const allQuotations = await getQuotations();

    // Apply filters
    let filtered = allQuotations;

    if (search) {
      filtered = filtered.filter(
        (q) =>
          q.quotationNo.toLowerCase().includes(search) ||
          (q.customerName && q.customerName.toLowerCase().includes(search)) ||
          (q.division && q.division.toLowerCase().includes(search))
      );
    }

    if (orderStatus !== "All") {
      filtered = filtered.filter((q) => (q.orderStatus || "") === orderStatus);
    }

    if (caseStatus !== "All") {
      filtered = filtered.filter((q) => {
        const cs = (q.caseStatus || "").trim();
        if (caseStatus === "Not Complete") {
          return q.orderStatus === "Won" && cs === "Not Complete";
        }
        return cs === caseStatus;
      });
    }

    if (division !== "All") {
      filtered = filtered.filter((q) => (q.division || "") === division);
    }

    // Date filtering
    const now = new Date();

    if (dateWise === "Today") {
      const todayKey = toDateKey(now);
      filtered = filtered.filter((q) => {
        const d = parseDate(q.quotationDate);
        return d && toDateKey(d) === todayKey;
      });
    } else if (dateWise === "This Week") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start.setDate(start.getDate() - ((now.getDay() + 6) % 7));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startKey = toDateKey(start);
      const endKey = toDateKey(end);
      filtered = filtered.filter((q) => {
        const d = parseDate(q.quotationDate);
        if (!d) return false;
        const key = toDateKey(d);
        return key >= startKey && key <= endKey;
      });
    } else if (dateWise === "This Month") {
      filtered = filtered.filter((q) => {
        const d = parseDate(q.quotationDate);
        return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    } else if (dateWise === "This Year") {
      const year = now.getFullYear();
      filtered = filtered.filter((q) => {
        const d = parseDate(q.quotationDate);
        return d && d.getFullYear() === year;
      });
    } else if (dateWise === "Custom Date Range") {
      const fromKey = fromDate.trim();
      const toKey = toDate.trim();
      const rangeValid = !(fromKey && toKey && fromKey > toKey);
      if (rangeValid && (fromKey || toKey)) {
        filtered = filtered.filter((q) => {
          const d = parseDate(q.quotationDate);
          if (!d) return false;
          const key = toDateKey(d);
          if (fromKey && key < fromKey) return false;
          if (toKey && key > toKey) return false;
          return true;
        });
      }
    }

    // Sort by quotationNo descending (newest first) — matches existing behavior
    filtered.sort((a, b) => b.quotationNo.localeCompare(a.quotationNo));

    // Pagination
    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const safePage = page > totalPages && totalPages > 0 ? totalPages : page;
    const start = (safePage - 1) * pageSize;
    const paginatedData = filtered.slice(start, start + pageSize);

    return NextResponse.json(
      {
        success: true,
        data: paginatedData,
        pagination: {
          page: safePage,
          pageSize,
          total,
          totalPages,
          hasNextPage: safePage < totalPages,
          hasPreviousPage: safePage > 1,
        },
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("[quotations/GET] Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to load quotations.", data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON.", errors: {} },
      { status: 400 }
    );
  }

  // Normalize date fields to DD/MM/YYYY canonical format
  if (body.quotation) {
    if (body.quotation.quotationDate) {
      body.quotation.quotationDate = normalizeToCanonicalDate(body.quotation.quotationDate);
    }
    if (body.quotation.partyReferenceDate) {
      body.quotation.partyReferenceDate = normalizeToCanonicalDate(body.quotation.partyReferenceDate);
    }
  }

  const { success, data, errors } = validateQuotation(body);

  if (!success) {
    return NextResponse.json(
      { success: false, message: "Please fix the highlighted fields and try again.", errors },
      { status: 422 }
    );
  }

  const quotationId = await generateNextQuotationNumber();
  const createdAt = new Date().toISOString();

  try {
    const { rowsWritten } = await appendQuotation(data, { quotationId, createdAt });
    
    return NextResponse.json(
      {
        success: true,
        message: "Quotation submitted successfully.",
        quotationId,
        rowsWritten,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[quotations/POST] Failed to write to Google Sheets:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "We couldn't save this quotation right now. Please try again in a moment.",
        errors: {},
      },
      { status: 502 }
    );
  }
}


