import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCandidates } from "@/api/candidate";

function pickDefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

const defaultFilters = {
  search: "",
  location: "",
  hometown: "",
  pincode: "",
  minExperience: "",
  maxExperience: "",
  skills: "",
  industry: "",
  company: "",
  designation: "",
  department: "",
  qualification: "",
};

/**
 * Server-backed candidate list with debounced filter params (400ms) and pagination.
 * Matches GET /candidates query params from the backend.
 */
export default function useCandidatesQuery({
  initialPage = 1,
  initialLimit = 20,
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [rawFilters, setRawFilters] = useState(() => ({ ...defaultFilters }));

  const filterKey = JSON.stringify(rawFilters);
  const [debouncedFilterKey, setDebouncedFilterKey] = useState(filterKey);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilterKey(filterKey), 400);
    return () => clearTimeout(t);
  }, [filterKey]);

  const prevDebounced = useRef(debouncedFilterKey);
  useEffect(() => {
    if (prevDebounced.current !== debouncedFilterKey) {
      prevDebounced.current = debouncedFilterKey;
      setPage(1);
    }
  }, [debouncedFilterKey]);

  const params = useMemo(() => {
    const f = JSON.parse(debouncedFilterKey);
    const nMin = f.minExperience === "" ? undefined : Number(f.minExperience);
    const nMax = f.maxExperience === "" ? undefined : Number(f.maxExperience);
    return pickDefined({
      page,
      limit,
      search: (f.search || "").trim() || undefined,
      location: (f.location || "").trim() || undefined,
      hometown: (f.hometown || "").trim() || undefined,
      pincode: (f.pincode || "").trim() || undefined,
      minExperience: Number.isFinite(nMin) ? nMin : undefined,
      maxExperience: Number.isFinite(nMax) ? nMax : undefined,
      skills: (f.skills || "").trim() || undefined,
      industry: (f.industry || "").trim() || undefined,
      company: (f.company || "").trim() || undefined,
      designation: (f.designation || "").trim() || undefined,
      department: (f.department || "").trim() || undefined,
      qualification: (f.qualification || "").trim() || undefined,
    });
  }, [page, limit, debouncedFilterKey]);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCandidates(params);
      const nextItems = Array.isArray(res?.items) ? res.items : [];
      const nextPagination = res?.pagination || {
        page: params.page,
        limit: params.limit,
        total: nextItems.length,
        totalPages: nextItems.length ? 1 : 0,
      };
      setItems(nextItems);
      setPagination(nextPagination);
    } catch (e) {
      setError(e?.message || "Failed to load candidates");
      setItems([]);
      setPagination({
        page: 1,
        limit: params.limit,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilters = useCallback((patch) => {
    setRawFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setRawFilters({ ...defaultFilters });
  }, []);

  return {
    items,
    pagination,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    filters: rawFilters,
    setFilters,
    resetFilters,
    reload: load,
  };
}
