"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Search, Pencil, Calendar, Filter, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/formatters";
import { useToast } from "@/hooks/useToast";
import QuotationDetailsModal from "@/components/quotations/QuotationDetailsModal";
import QuotationFollowupModal from "@/components/quotations/QuotationFollowupModal";
import UpdateCaseStatusModal from "@/components/quotations/UpdateCaseStatusModal";
import QuotationFilterBar from "@/components/quotations/QuotationFilterBar";
import { DIVISIONS } from "@/constants/masterData";

const CLOSING_ORDER_STATUSES = new Set(["Won", "Loss", "Dead", "Partial"]);

const ORDER_STATUS_BADGE_COLORS = {
  Pending: "bg-[#FEF3C7] text-[#92400E]",
  Won: "bg-[#DCFCE7] text-[#166534]",
  Loss: "bg-[#FEE2E2] text-[#991B1B]",
  Dead: "bg-[#F3F4F6] text-[#4B5563]",
  Partial: "bg-[#FFEDD5] text-[#9A3412]",
};

const PAGE_SIZE = 20;

const CASE_STATUS_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Complete", label: "Complete" },
  { value: "Not Complete", label: "Not Complete" },
];

const ORDER_STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Won", label: "Won" },
  { value: "Loss", label: "Loss" },
  { value: "Dead", label: "Dead" },
  { value: "Partial", label: "Partial" },
];

const DIVISION_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  ...DIVISIONS,
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState([]);
  const [caseStatusFilter, setCaseStatusFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [dateWiseFilter, setDateWiseFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewQuotationNo, setViewQuotationNo] = useState(null);
  const [followUpQuotationNo, setFollowUpQuotationNo] = useState(null);
  const [caseStatusEdit, setCaseStatusEdit] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const router = useRouter();
  const toast = useToast();

  const loadQuotations = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (orderStatusFilter.length > 0) params.set("orderStatus", orderStatusFilter.join(","));
      if (caseStatusFilter !== "All") params.set("caseStatus", caseStatusFilter);
      if (divisionFilter !== "All") params.set("division", divisionFilter);
      if (dateWiseFilter !== "All") params.set("dateWise", dateWiseFilter);
      if (dateWiseFilter === "Custom Date Range") {
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);
      }

      const res = await fetch(`/api/quotations?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuotations(json.data);
        setPagination(json.pagination);
        setCurrentPage(json.pagination.page);
      } else {
        setError(json.message || "Failed to load quotations.");
      }
    } catch (err) {
      setError(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, orderStatusFilter, caseStatusFilter, divisionFilter, dateWiseFilter, fromDate, toDate]);

  useEffect(() => {
    loadQuotations(1);
  }, [loadQuotations]);

  const openQuotationForEdit = useCallback(
    (quotationNo) => {
      router.push(`/quotations/${encodeURIComponent(quotationNo)}/edit`);
    },
    [router]
  );

  const activeFilterCount = [
    orderStatusFilter.length > 0,
    caseStatusFilter !== "All",
    divisionFilter !== "All",
    dateWiseFilter !== "All",
    dateWiseFilter === "Custom Date Range" && (fromDate || toDate),
  ].filter(Boolean).length;

  const handleClearFilters = useCallback(() => {
    setOrderStatusFilter([]);
    setCaseStatusFilter("All");
    setDivisionFilter("All");
    setDateWiseFilter("All");
    setFromDate("");
    setToDate("");
  }, []);

  const handleFilterChange = useCallback((changes) => {
    if (changes.orderStatus !== undefined) setOrderStatusFilter(changes.orderStatus);
    if (changes.caseStatus !== undefined) setCaseStatusFilter(changes.caseStatus);
    if (changes.division !== undefined) setDivisionFilter(changes.division);
    if (changes.dateWise !== undefined) setDateWiseFilter(changes.dateWise);
    if (changes.fromDate !== undefined) setFromDate(changes.fromDate);
    if (changes.toDate !== undefined) setToDate(changes.toDate);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    loadQuotations(newPage);
  }, [loadQuotations]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    loadQuotations(1);
  }, [loadQuotations]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || activeFilterCount > 0;

  // Pagination range calculation
  const getPaginationRange = () => {
    const { page, totalPages } = pagination;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const startRecord = pagination.total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(currentPage * PAGE_SIZE, pagination.total);

  return (
    <AppShell breadcrumb="Quotations" title="All Quotations">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <form onSubmit={handleSearchSubmit} className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotations..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-ink-100 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors cursor-text"
            />
          </form>
          <button
            type="button"
            onClick={() => setIsFilterOpen((v) => !v)}
            aria-expanded={isFilterOpen}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors duration-150 cursor-pointer",
              isFilterOpen || activeFilterCount > 0
                ? "bg-accent-50 border-accent-200 text-accent-700"
                : "bg-white border-ink-100 text-ink-600 hover:border-ink-200 hover:bg-ink-50"
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-400 whitespace-nowrap">
            {loading
              ? "Loading..."
              : pagination.total === 0
                ? "No quotations"
                : `Showing ${startRecord}–${endRecord} of ${pagination.total}`}
          </p>
          <Link href="/quotations/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Quotation
            </Button>
          </Link>
        </div>
      </div>

      {isFilterOpen && !error && (
        <div className="mt-4 animate-fade-slide-in">
          <QuotationFilterBar
            orderStatusOptions={ORDER_STATUS_FILTER_OPTIONS}
            divisionOptions={DIVISION_FILTER_OPTIONS}
            caseStatusOptions={CASE_STATUS_OPTIONS}
            filters={{
              orderStatus: orderStatusFilter,
              caseStatus: caseStatusFilter,
              division: divisionFilter,
              dateWise: dateWiseFilter,
              fromDate,
              toDate,
            }}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
            filteredCount={pagination.total}
          />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {error && (
          <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Could not load quotations
            </h2>
            <p className="max-w-sm text-sm text-ink-400">{error}</p>
          </Card>
        )}

        {!error && loading && (
          <Card>
            <div className="overflow-x-auto rounded-lg border border-ink-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-50 border-b border-ink-100">
                    {["Quotation No", "Date", "Customer", "Contact Number", "NOF", "Order Status", "Case Status", "Total Amount", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-ink-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-ink-100 rounded animate-pulse" style={{ width: `${65 + ((i * 7 + j * 13) % 30)}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {!error && !loading && quotations.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="font-display text-lg font-semibold text-ink-900">
              {hasActiveFilters ? "No matching quotations" : "No quotations yet"}
            </h2>
            <p className="max-w-sm text-sm text-ink-400">
              {hasActiveFilters
                ? "Try a different search term or adjust the filters."
                : "Start by creating your first quotation. Submitted quotations are saved straight to your Google Sheet and will appear here."}
            </p>
            {!hasActiveFilters && (
              <Link href="/quotations/new" className="mt-2">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Quotation
                </Button>
              </Link>
            )}
          </Card>
        )}

        {!error && !loading && quotations.length > 0 && (
          <Card>
            <div className="overflow-x-auto rounded-lg border border-ink-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-50 border-b border-ink-100">
                    {["Quotation No", "Date", "Customer", "Contact Number", "NOF", "Order Status", "Case Status", "Total Amount", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-ink-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr
                      key={q.quotationNo}
                      className="border-b border-ink-50 transition-colors hover:bg-ink-50/50"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-accent-600 whitespace-nowrap">
                        <button
                          onClick={() => setViewQuotationNo(q.quotationNo)}
                          className="hover:underline hover:text-accent-700 transition-colors cursor-pointer"
                          title="View quotation"
                        >
                          {q.quotationNo}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink-600 whitespace-nowrap text-xs">
                        {q.quotationDate || "-"}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate font-medium text-ink-900" title={q.customerName}>
                        {q.customerName}
                      </td>
                      <td className="px-4 py-3 text-ink-600 whitespace-nowrap">
                        {q.contactNumber || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink-600 font-medium">
                        {q.numberOfFollowup || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_BADGE_COLORS[q.orderStatus] || "bg-accent-50 text-accent-700"}`}>
                          {q.orderStatus || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {q.orderStatus === "Won" && q.caseStatus ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            q.caseStatus === "Complete"
                              ? "bg-teal-50 text-teal-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {q.caseStatus}
                          </span>
                        ) : (
                          <span className="text-ink-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-ink-900">
                        {formatCurrency(q.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuotationForEdit(q.quotationNo);
                            }}
                            className="p-1.5 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {q.orderStatus === "Won" && q.caseStatus === "Not Complete" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCaseStatusEdit({
                                  quotationNo: q.quotationNo,
                                  timestamp: q.caseStatusTimestamp,
                                  currentCaseStatus: q.caseStatus,
                                });
                              }}
                              className="p-1.5 rounded-md text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors cursor-pointer"
                              title="Update Case Status"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFollowUpQuotationNo(q.quotationNo);
                            }}
                            className="p-1.5 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                            title={
                              CLOSING_ORDER_STATUSES.has(String(q.orderStatus || "").trim())
                                ? "Follow-up closed — update Order Status"
                                : "Next Follow-up"
                            }
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-ink-100">
                <p className="text-sm text-ink-500">
                  Page {currentPage} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      pagination.hasPreviousPage
                        ? "text-ink-600 hover:bg-ink-50 cursor-pointer"
                        : "text-ink-300 cursor-not-allowed"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  {getPaginationRange().map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-ink-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "inline-flex h-8 min-w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
                          page === currentPage
                            ? "bg-accent-500 text-white"
                            : "text-ink-600 hover:bg-ink-50"
                        )}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      pagination.hasNextPage
                        ? "text-ink-600 hover:bg-ink-50 cursor-pointer"
                        : "text-ink-300 cursor-not-allowed"
                    )}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {viewQuotationNo && (
        <QuotationDetailsModal
          quotationNo={viewQuotationNo}
          onClose={() => setViewQuotationNo(null)}
        />
      )}

      {followUpQuotationNo && (
        <QuotationFollowupModal
          quotationNo={followUpQuotationNo}
          orderStatus={
            quotations.find((q) => q.quotationNo === followUpQuotationNo)?.orderStatus || ""
          }
          onClose={() => setFollowUpQuotationNo(null)}
          onDataChanged={() => loadQuotations(currentPage)}
        />
      )}

      {caseStatusEdit && (
        <UpdateCaseStatusModal
          quotationNo={caseStatusEdit.quotationNo}
          timestamp={caseStatusEdit.timestamp}
          currentCaseStatus={caseStatusEdit.currentCaseStatus}
          onClose={() => setCaseStatusEdit(null)}
          onSuccess={() => loadQuotations(currentPage)}
        />
      )}

      </AppShell>
  );
}
