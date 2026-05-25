export type ICDCode = {
  code: string;
  description: string;
  category: string;
};

/**
 * Query parameters accepted by `GET /api/v1/reference/icd-codes`.
 * Backend filtering is preferred over client-side filtering because the
 * dataset is large (thousands of codes) and ships only a paginated slice.
 */
export interface IcdCodeQuery {
  /** Free-text match against code OR description. */
  search?: string;
  /** Exact-match filter on the chapter / block category name. */
  category?: string;
  /** 1-indexed page number. Defaults to 1 server-side. */
  page?: number;
  /** Items per page. Defaults to 30 server-side. */
  page_size?: number;
}

/**
 * The backend returns categories either as plain strings or as objects
 * with a name field — we normalise both shapes to a `string` for the UI.
 */
export type ICDCategory = string;
