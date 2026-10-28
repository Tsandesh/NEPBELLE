import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { productService } from '../services/product.service.js';

export const catalogController = {
  list: asyncHandler(async (req, res) => {
    const { items, meta } = await productService.list(req.query as any);
    ok(res, items, meta);
  }),
  detail: asyncHandler(async (req, res) => ok(res, await productService.bySlug(req.params.slug))),
  facets: asyncHandler(async (req, res) => ok(res, await productService.facets(req.query.category as string | undefined))),
  categories: asyncHandler(async (_req, res) => ok(res, await productService.categories())),
};
