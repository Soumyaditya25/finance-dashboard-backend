export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Parse page/limit from query params and compute skip for Prisma.
 */
export function parsePagination(
  rawPage: unknown,
  rawLimit: unknown,
  maxLimit = 100,
): PaginationParams {
  const page = Math.max(1, Number(rawPage) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(rawLimit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build the meta object to attach to paginated responses.
 */
export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
