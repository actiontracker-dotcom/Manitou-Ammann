"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";

const CASE_STATUS_OPTIONS = [
  { value: "Complete", label: "Complete" },
  { value: "Not Complete", label: "Not Complete" },
];

export default function UpdateCaseStatusModal({
  quotationNo,
  timestamp,
  currentCaseStatus,
  onClose,
  onSuccess,
}) {
  const toast = useToast();
  const [caseStatus, setCaseStatus] = useState(currentCaseStatus || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    if (!caseStatus) {
      setError("Please select a Case Status.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch(
        `/api/quotations/${encodeURIComponent(quotationNo)}/followup`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseStatus, timestamp }),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update Case Status.");
      }

      toast.success("Case Status updated", `Case Status for ${quotationNo} updated to "${caseStatus}".`);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update Case Status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 sm:p-8 overflow-y-auto">
      <div className="fixed inset-0 bg-ink-950/40 cursor-pointer" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-50 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-500">
              Case Status
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-ink-900">Update Case Status</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-300 hover:text-ink-600 hover:bg-ink-50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-ink-400">Quotation</p>
            <p className="text-sm font-medium text-ink-900 font-mono">{quotationNo}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-400">Current Case Status</p>
            <p className="text-sm font-medium text-ink-900">{currentCaseStatus || "Not set"}</p>
          </div>

          <Select
            label="New Case Status"
            options={CASE_STATUS_OPTIONS}
            placeholder="Select case status"
            value={caseStatus}
            onChange={(e) => {
              setCaseStatus(e.target.value);
              setError(null);
            }}
            error={error}
          />

          {error && (
            <p className="text-sm font-medium text-danger-500">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
