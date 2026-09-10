import { getQuotationByNo } from "./googleSheetsService.js";

const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 15000;
const RETRY_DELAYS_MS = [1000, 3000, 9000];

function getOtdConfig() {
  const apiUrl = process.env.O2D_SYNC_API_URL;
  const secret = process.env.O2D_SYNC_SECRET;

  if (!apiUrl) {
    return { configured: false, error: "O2D_SYNC_API_URL is not set" };
  }
  if (!secret) {
    return { configured: false, error: "O2D_SYNC_SECRET is not set" };
  }

  return { configured: true, apiUrl, secret };
}

function normalizeGstNo(value) {
  return String(value || "").trim().toUpperCase();
}

function safeStr(value) {
  return String(value || "").trim();
}

export function buildOtdPayload(quotation) {
  const { quotationNo, customer, quotation: info, items, followup } = quotation;

  return {
    quotationNo: safeStr(quotationNo),
    customer: {
      customerName: safeStr(customer.customerName),
      gstNo: normalizeGstNo(customer.gstNo),
      address: safeStr(customer.fullAddress),
      stateName: safeStr(customer.stateName),
      stateCode: safeStr(customer.stateCode),
      contactPerson: safeStr(customer.contactPerson),
      contactNumber: safeStr(customer.contactNumber),
      email: safeStr(customer.emailTo),
      division: safeStr(info.division),
    },
    items: items.map((item, index) => ({
      partNo: safeStr(item.partNumber),
      description: safeStr(item.description),
      hsnCode: safeStr(item.hsnCode),
      uom: safeStr(item.uom) || "Nos",
      qty: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      discount: Number(item.discount) || 0,
      otherRate: Number(item.otherRate) || 0,
      gstRate: Number(item.gstRate) || 18,
      itemIndex: index,
    })),
    paymentTerms: safeStr(info.paymentTerms),
    termsOfDelivery: safeStr(info.termsOfDelivery),
    orderDate: safeStr(info.quotationDate),
    orderReceivedDate: safeStr(followup.orderReceivedDate),
  };
}

async function postToOtd(apiUrl, secret, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const status = res.status;
    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    return { ok: res.ok, status, body };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function isRetryable(error, status) {
  if (error && (error.name === "AbortError" || error.type === "aborted")) return true;
  if (error && (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.code === "ECONNRESET")) return true;
  if (status === 429 || status === 502 || status === 503 || status === 504) return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncQuotationToOtd(quotationNo) {
  const config = getOtdConfig();
  if (!config.configured) {
    console.error("[OTD Sync] Skipped:", config.error);
    return { success: false, quotationNo, error: config.error };
  }

  let quotation;
  try {
    quotation = await getQuotationByNo(quotationNo);
  } catch (error) {
    console.error("[OTD Sync] Failed to read quotation:", quotationNo, error.message);
    return { success: false, quotationNo, error: "Failed to read quotation: " + error.message };
  }

  if (!quotation) {
    console.error("[OTD Sync] Quotation not found:", quotationNo);
    return { success: false, quotationNo, error: "Quotation not found" };
  }

  const payload = buildOtdPayload(quotation);

  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
    }

    try {
      const result = await postToOtd(config.apiUrl, config.secret, payload);

      if (result.ok) {
        return { success: true, quotationNo, status: result.status };
      }

      if (result.status === 401 || result.status === 403) {
        console.error("[OTD Sync] Auth error:", result.status, "— not retrying");
        return { success: false, quotationNo, error: "Authentication failed (" + result.status + ")" };
      }

      if (!isRetryable(null, result.status)) {
        console.error("[OTD Sync] Non-retryable error:", result.status);
        return { success: false, quotationNo, error: "OTD returned status " + result.status };
      }

      lastError = new Error("OTD returned status " + result.status);
    } catch (error) {
      if (!isRetryable(error, null)) {
        console.error("[OTD Sync] Non-retryable network error:", error.message);
        return { success: false, quotationNo, error: error.message };
      }
      lastError = error;
    }
  }

  console.error("[OTD Sync] All retries exhausted:", quotationNo, lastError?.message);
  return { success: false, quotationNo, error: "All retries failed: " + (lastError?.message || "unknown") };
}
