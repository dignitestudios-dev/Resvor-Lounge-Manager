"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Reusable hook to synchronize pagination, search, and filters with URL search parameters.
 * - Restores state on page refresh
 * - Preserves existing filters and search when changing pages
 * - Resets page to 1 when search or filters change
 * - Updates the URL via router.push()
 */
export function useListingUrlParams(defaultValues = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse page number safely from URL query params
  const page = useMemo(() => {
    const raw = searchParams.get("page");
    if (!raw) return defaultValues.page || 1;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams, defaultValues.page]);

  // Read search string from URL
  const search = useMemo(() => {
    return searchParams.get("search") ?? defaultValues.search ?? "";
  }, [searchParams, defaultValues.search]);

  // Read any custom filter by key
  const getParam = useCallback(
    (key, fallback = "") => {
      return searchParams.get(key) ?? defaultValues[key] ?? fallback;
    },
    [searchParams, defaultValues]
  );

  // Update URL search parameters while preserving existing ones
  const setParams = useCallback(
    (newParams, { resetPage = false } = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });

      if (resetPage && !("page" in newParams)) {
        next.set("page", "1");
      }

      const queryString = next.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Change page while preserving existing search and filter parameters
  const setPage = useCallback(
    (newPage) => {
      const targetPage = typeof newPage === "function" ? newPage(page) : newPage;
      const validPage = Math.max(1, parseInt(String(targetPage), 10) || 1);
      setParams({ page: validPage });
    },
    [page, setParams]
  );

  // Update search query (automatically resets page to 1)
  const setSearch = useCallback(
    (newSearch) => {
      setParams({ search: newSearch }, { resetPage: true });
    },
    [setParams]
  );

  // Consolidated params dictionary resolved from URL query params with defaults
  const params = useMemo(() => {
    const result = { page, search };
    Object.keys(defaultValues).forEach((key) => {
      result[key] = searchParams.get(key) ?? defaultValues[key];
    });
    return result;
  }, [page, search, searchParams, defaultValues]);

  return {
    page,
    search,
    params,
    getParam,
    setPage,
    setSearch,
    setParams,
    searchParams,
  };
}
