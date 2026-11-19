"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import PageLoader from "./PageLoader";

const CustomPagination = ({
  loading = false,
  totalPages = 1,
  currentPage,
  page: propPage,
  totalRecords,
  limit = 10,
  itemLabel = "records",
  onPageChange = () => {},
  children,
}) => {
  // Use controlled currentPage / propPage if passed, otherwise internal state
  const effectiveCurrentPage = currentPage !== undefined ? currentPage : propPage;
  const [internalPage, setInternalPage] = useState(effectiveCurrentPage || 1);

  useEffect(() => {
    if (effectiveCurrentPage !== undefined && Number(effectiveCurrentPage) >= 1) {
      setInternalPage(Number(effectiveCurrentPage));
    }
  }, [effectiveCurrentPage]);

  const activePage = effectiveCurrentPage !== undefined ? Number(effectiveCurrentPage) || 1 : internalPage;
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);

  const preventPrevious = activePage <= 1;
  const preventNext = activePage >= safeTotalPages;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > safeTotalPages || newPage === activePage || loading) return;
    setInternalPage(newPage);
    onPageChange(newPage);
  };

  // Direct page numbers calculation with intelligent windowing
  const pageNumbers = useMemo(() => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (activePage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", safeTotalPages);
    } else if (activePage >= safeTotalPages - 3) {
      pages.push(
        1,
        "...",
        safeTotalPages - 4,
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages
      );
    } else {
      pages.push(1, "...", activePage - 1, activePage, activePage + 1, "...", safeTotalPages);
    }
    return pages;
  }, [activePage, safeTotalPages]);

  // Records range calculation
  const total = typeof totalRecords === "number" ? Math.max(0, totalRecords) : null;
  const from = total === 0 ? 0 : (activePage - 1) * limit + 1;
  const to = total === null ? null : Math.min(activePage * limit, total);

  return (
    <>
      {loading && activePage <= 1 ? (
        <PageLoader />
      ) : (
        <div className="bg-white rounded-xl h-full flex flex-col gap-2 justify-between overflow-auto">
          {loading && activePage > 1 ? <PageLoader /> : children}

          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-3 px-4 border-t border-gray-100 mt-auto">
            {/* Left: Total Count & Range */}
            <div className="text-xs text-gray-500 font-medium select-none">
              {total !== null ? (
                total > 0 ? (
                  <span>
                    Showing <span className="font-semibold text-gray-800">{from}</span>–
                    <span className="font-semibold text-gray-800">{to}</span> of{" "}
                    <span className="font-semibold text-gray-800">{total}</span> {itemLabel}
                  </span>
                ) : (
                  <span>No {itemLabel} found</span>
                )
              ) : (
                <span>
                  Page <span className="font-semibold text-gray-800">{activePage}</span> of{" "}
                  <span className="font-semibold text-gray-800">{safeTotalPages}</span>
                </span>
              )}
            </div>

            {/* Right: Navigation Controls (Prev, Direct Pages, Next) */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
              {/* Previous Button */}
              <button
                type="button"
                disabled={loading || preventPrevious}
                onClick={() => handlePageChange(activePage - 1)}
                className={`flex items-center gap-1 h-8 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                  loading || preventPrevious
                    ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 cursor-pointer shadow-2xs"
                }`}
                aria-label="Previous page"
              >
                <IoChevronBack className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Previous</span>
              </button>

              {/* Direct Page Numbers */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-gray-400 text-xs select-none"
                      >
                        …
                      </span>
                    );
                  }
                  const isCurrent = p === activePage;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={loading || isCurrent}
                      onClick={() => handlePageChange(p)}
                      className={`h-8 min-w-8 px-2 rounded-lg text-xs font-semibold transition-all ${
                        isCurrent
                          ? "bg-primary text-white shadow-xs cursor-default"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 cursor-pointer"
                      }`}
                      aria-label={`Page ${p}`}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                disabled={loading || preventNext}
                onClick={() => handlePageChange(activePage + 1)}
                className={`flex items-center gap-1 h-8 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                  loading || preventNext
                    ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 cursor-pointer shadow-2xs"
                }`}
                aria-label="Next page"
              >
                <span className="hidden md:inline">Next</span>
                <IoChevronForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomPagination;
