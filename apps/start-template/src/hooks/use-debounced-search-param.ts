import { useEffect, useMemo, useRef, useState } from "react";

type RouteSearchFrom<RouteApi> = RouteApi extends {
  types: { fullSearchSchema: infer TSchema };
}
  ? TSchema extends Record<string, unknown>
    ? TSchema
    : Record<string, unknown>
  : RouteApi extends { useSearch: (...args: unknown[]) => infer TSearch }
    ? TSearch extends Record<string, unknown>
      ? TSearch
      : Record<string, unknown>
    : Record<string, unknown>;

// Constrain to keys whose non-nullish value is string-like (e.g. string | undefined)
type StringSearchKeys<T extends Record<string, unknown>> = {
  [K in keyof T]: NonNullable<T[K]> extends string ? Extract<K, string> : never;
}[keyof T];

export type UseDebouncedSearchParamOptions = {
  /** Debounce time in ms (default 300) */
  wait?: number;
  /** Update history entry or replace it (default replace=true to avoid stack spam) */
  replace?: boolean;
  /** Trim whitespace prior to commit */
  trim?: boolean;
};

/**
 * Route-scoped, type-safe hook for a debounced text search param.
 * Keeps local state instant & commits URL on debounce.
 */
export function useDebouncedSearchParam<
  RouteApi extends {
    types: { fullSearchSchema: Record<string, unknown> };
    useSearch: (...args: unknown[]) => unknown;
    useNavigate: (...args: unknown[]) => unknown;
  },
  Key extends StringSearchKeys<RouteSearchFrom<RouteApi>>,
>(routeApi: RouteApi, key: Key, opts: UseDebouncedSearchParamOptions = {}) {
  type RouteSearch = RouteSearchFrom<RouteApi>;

  const { wait = 300, replace = true, trim = true } = opts;

  const navigate = routeApi.useNavigate() as (args: {
    to: string;
    replace?: boolean;
    resetScroll?: boolean;
    search: (prev: RouteSearch) => RouteSearch;
  }) => void;
  const search = routeApi.useSearch() as RouteSearch;

  const committed = (search[key] ?? "") as string;
  const [draft, setDraft] = useState<string>(() => committed);
  const pendingCommitRef = useRef<string | null>(null);

  // Keep local draft in sync if URL changes externally (back/forward, link clicks, etc.)
  useEffect(() => {
    if (
      pendingCommitRef.current !== null &&
      committed === pendingCommitRef.current
    ) {
      pendingCommitRef.current = null;
      return;
    }

    pendingCommitRef.current = null;

    setDraft((prev) => {
      if (prev === committed) {
        return prev;
      }
      if (trim && prev.trim() === committed) {
        return prev;
      }
      return committed;
    });
  }, [committed, trim]);

  // Manual debounce implementation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (draft === committed) {
        return;
      }
      const value = trim ? draft.trim() : draft;
      if (value === committed) {
        return;
      }

      pendingCommitRef.current = value;

      navigate({
        to: ".",
        replace,
        resetScroll: false,
        search: (prev: RouteSearch): RouteSearch => ({
          ...prev,
          [key]: value ? (value as RouteSearch[Key]) : (undefined as unknown),
        }),
      });
    }, wait);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [draft, committed, key, navigate, replace, trim, wait]);

  // Convenience helpers for inputs
  const bind = useMemo(
    () => ({
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(e.target.value);
      },
      // Optional: commit immediately on blur
      onBlur: () => {
        const value = trim ? draft.trim() : draft;
        if (value === committed) {
          return;
        }
        pendingCommitRef.current = value;
        navigate({
          to: ".",
          replace,
          resetScroll: false,
          search: (prev: RouteSearch): RouteSearch => ({
            ...prev,
            [key]: value ? (value as RouteSearch[Key]) : (undefined as unknown),
          }),
        });
      },
    }),
    [committed, draft, key, navigate, replace, trim]
  );

  return {
    inputValue: draft,
    setValue: setDraft,
    searchValue: committed,
    bind,
    clear: () => {
      setDraft("");
    },
  };
}
