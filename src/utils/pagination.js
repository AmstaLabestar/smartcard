const { z } = require('zod');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

function getPaginationParams(query = {}) {
  const { page, limit } = paginationQuerySchema.parse(query);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function createPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  paginationQuerySchema,
  getPaginationParams,
  createPaginationMeta,
};
