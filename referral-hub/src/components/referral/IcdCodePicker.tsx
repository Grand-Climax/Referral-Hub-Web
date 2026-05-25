"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetIcdCategoriesQuery,
  useGetIcdCodesQuery,
} from "@/features/reference/icdApi";

const ALL_CATEGORIES = "__all__";
const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 250;

interface IcdCodePickerProps {
  /** The currently selected ICD-10 code (just the code string). */
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  /**
   * Optional className applied to the trigger button — lets the host form
   * keep its existing row layout without us hard-coding widths.
   */
  className?: string;
  /** Disables the entire picker (e.g. while the form is submitting). */
  disabled?: boolean;
}

/**
 * Searchable ICD-10 combobox with a category filter.
 *
 * The full dataset is too large for an offline `<Select>` so we delegate
 * filtering to the backend. The component owns its own search / category /
 * page state and re-issues `GET /api/v1/reference/icd-codes` whenever any
 * of those change. RTK Query dedupes identical requests across multiple
 * picker instances on the same form.
 *
 * The trigger displays "CODE — description" once a row is chosen. When
 * the form is hydrated with an existing code we don't immediately know the
 * description, so the trigger falls back to just the code until the user
 * opens the picker and the row loads into the cache.
 */
export function IcdCodePicker({
  value,
  onChange,
  placeholder = "Select ICD-10 code",
  className,
  disabled,
}: IcdCodePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [page, setPage] = useState(1);

  // Debounce keystrokes so we don't hammer the server while the user types.
  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
  }, [search]);

  // Any change to the filters drops the user back to page 1; otherwise
  // they could be paged past the end of the new (smaller) result set.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetIcdCategoriesQuery();

  const { data: results = [], isFetching } = useGetIcdCodesQuery({
    search: debouncedSearch || undefined,
    category: category === ALL_CATEGORIES ? undefined : category,
    page,
    page_size: PAGE_SIZE,
  });

  // Remember the human-readable description for the currently selected
  // code so the trigger doesn't degrade to just the code after the user
  // changes filters (which would otherwise scroll the row out of view).
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  useEffect(() => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }
    const match = results.find((r) => r.code === value);
    if (match) setSelectedLabel(match.description);
  }, [value, results]);

  const handleSelect = (code: string, description: string) => {
    onChange(code);
    setSelectedLabel(description);
    setOpen(false);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory(ALL_CATEGORIES);
    setPage(1);
  };

  const hasActiveFilters =
    category !== ALL_CATEGORIES || debouncedSearch.length > 0;

  // The "Next" button can only be inferred from the page size — when the
  // server returns fewer than PAGE_SIZE rows we're necessarily on the last
  // page. The response payload doesn't currently include a total count.
  const canPageNext = results.length >= PAGE_SIZE;
  const canPagePrev = page > 1;

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  // Focus the search input on open without using `autoFocus` — autoFocus
  // fires before the popover's transition completes and the cursor ends
  // up in an awkward place.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const triggerLabel = useMemo(() => {
    if (!value)
      return <span className="text-muted-foreground">{placeholder}</span>;
    return (
      <span className="truncate">
        <span className="font-semibold">{value}</span>
        {selectedLabel && (
          <span className="text-muted-foreground">
            {" "}
            — {selectedLabel}
          </span>
        )}
      </span>
    );
  }, [value, selectedLabel, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={`w-full justify-between h-9 text-sm font-normal rounded-lg ${
            className ?? ""
          }`}
        >
          {triggerLabel}
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[380px] max-w-[460px]"
        // Pop the picker out of the form's overflow context so it doesn't
        // get clipped by parent cards / scroll containers.
      >
        {/* ─── Filter bar ──────────────────────────────────────────── */}
        <div className="border-b border-border p-2.5 space-y-2 bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder="Search by code or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-7 h-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isLoadingCategories}
            >
              <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 px-2 text-xs gap-1 shrink-0"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* ─── Result list ─────────────────────────────────────────── */}
        <div className="max-h-72 overflow-y-auto">
          {isFetching && (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          )}

          {!isFetching && results.length === 0 && (
            <div className="flex flex-col items-center gap-1 px-3 py-8 text-center">
              <Search className="h-5 w-5 text-muted-foreground/50" />
              <p className="text-xs font-medium text-foreground">
                No ICD-10 codes match
              </p>
              <p className="text-[11px] text-muted-foreground">
                Try a different search term or category.
              </p>
            </div>
          )}

          {!isFetching && results.length > 0 && (
            <ul className="py-1" role="listbox">
              {results.map((item) => {
                const isSelected = item.code === value;
                return (
                  <li key={item.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.code, item.description)}
                      className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-2 ${
                        isSelected ? "bg-accent/60" : ""
                      }`}
                    >
                      <Check
                        className={`h-3.5 w-3.5 mt-0.5 shrink-0 text-primary ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-semibold text-xs text-foreground">
                            {item.code}
                          </span>
                          {item.category && (
                            <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/80 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ─── Pagination ──────────────────────────────────────────── */}
        {(canPagePrev || canPageNext) && (
          <div className="border-t border-border px-2.5 py-2 flex items-center justify-between text-xs bg-muted/30">
            <span className="text-muted-foreground tabular-nums">
              Page {page}
              {!canPageNext && page > 1 ? " (last)" : ""}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPagePrev || isFetching}
                className="h-6 px-2 text-xs gap-0.5"
              >
                <ChevronLeft className="h-3 w-3" />
                Prev
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!canPageNext || isFetching}
                className="h-6 px-2 text-xs gap-0.5"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
