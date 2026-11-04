"use client";

import { useEffect, useRef, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LISTINGS_META_DOC, PropertiesPageResult } from "@/lib/properties";
import type { PropertyListing } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
};

const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 60_000,
  keepPreviousData: true,
};

/**
 * Live instant refresh hook.
 * Subscribes to the single metadata doc `meta/listings`.
 * Whenever an owner adds, edits, or deletes a listing, this hook detects the version increment
 * and instantly instructs SWR to re-fetch all active property listings without any page reload.
 */
export function useListingsLiveRefresh() {
  const { mutate } = useSWRConfig();
  const lastVersionRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const metaRef = doc(db, LISTINGS_META_DOC[0], LISTINGS_META_DOC[1]);

    const unsubscribe = onSnapshot(
      metaRef,
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.exists()) return;
        const version = snapshot.data()?.version;
        if (typeof version !== "number") return;

        // Skip the initial mount emission to avoid redundant revalidation
        if (lastVersionRef.current === null) {
          lastVersionRef.current = version;
          return;
        }

        if (version !== lastVersionRef.current) {
          lastVersionRef.current = version;
          // Invalidate both standard and SWR Infinite ($inf$) cache keys
          mutate(
            (key) =>
              typeof key === "string" &&
              (key.startsWith("/api/properties") || key.includes("/api/properties"))
          );
        }
      },
      (err) => {
        console.warn("Live refresh snapshot listener warning:", err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [mutate]);
}

/**
 * Paginated infinite query for listings.
 * Cursor-based with 8 items per page, backed by SWR cache and server cache.
 */
export function useInfiniteProperties(
  initialPage?: PropertiesPageResult,
  district?: string | null
) {
  const getKey = (pageIndex: number, previousPageData: PropertiesPageResult | null) => {
    // If reached end of listings
    if (previousPageData && !previousPageData.nextCursor) return null;
    const base = "/api/properties";
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    if (pageIndex > 0 && previousPageData?.nextCursor) {
      params.set("cursor", previousPageData.nextCursor);
    }
    const q = params.toString();
    return q ? `${base}?${q}` : base;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<PropertiesPageResult>(
    getKey,
    fetcher,
    {
      ...swrOptions,
      fallbackData: initialPage ? [initialPage] : undefined,
    }
  );

  const items = useMemo(() => {
    return data ? data.flatMap((page) => page.items) : (initialPage?.items ?? []);
  }, [data, initialPage]);
  const isLoadingInitial = !data && !error;
  const isLoadingMore =
    isLoadingInitial || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.items?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data.length > 0 && !data[data.length - 1]?.nextCursor);

  const loadMore = () => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  return {
    items,
    error,
    isLoading: isLoadingInitial,
    isLoadingMore,
    isReachingEnd: Boolean(isReachingEnd),
    isValidating,
    loadMore,
    mutate,
    size,
    setSize,
  };
}

/**
 * Hook to fetch all published listings for map markers and full-dataset filtering.
 */
export function useAllDistrictProperties(district?: string | null) {
  const url = `/api/properties?all=true${district ? `&district=${encodeURIComponent(district)}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR<{ items: PropertyListing[] }>(
    url,
    fetcher,
    swrOptions
  );

  return {
    items: data?.items || [],
    isLoading,
    isError: Boolean(error),
    mutate,
  };
}

/** Legacy flat properties hook for backward compatibility */
export function useProperties(fallbackData?: PropertyListing[]) {
  const { items, isLoading, error, mutate } = useInfiniteProperties(
    fallbackData ? { items: fallbackData, nextCursor: null } : undefined
  );
  return { data: items, isLoading, error, mutate };
}

/** Fetch a single property with full-size images */
export function useProperty(id: string, fallbackData?: PropertyListing) {
  return useSWR<PropertyListing>(id ? `/api/properties/${id}` : null, fetcher, {
    ...swrOptions,
    fallbackData,
  });
}
