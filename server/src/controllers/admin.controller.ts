import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { created, noContent, ok } from '../utils/apiResponse.js';
import { adminService as s } from '../services/admin.service.js';
import { uploadService } from '../services/upload.service.js';

export const adminController = {
  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw AppError.badRequest('No file uploaded');
    ok(res, await uploadService.save(req.file));
  }),
  products: {
    list: asyncHandler(async (req, res) => { const { items, meta } = await s.listProducts(req.query as any); ok(res, items, meta); }),
    get: asyncHandler(async (req, res) => ok(res, await s.getProduct(req.params.id))),
    create: asyncHandler(async (req, res) => created(res, await s.createProduct(req.body))),
    update: asyncHandler(async (req, res) => ok(res, await s.updateProduct(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => { await s.deleteProduct(req.params.id); noContent(res); }),
  },
  categories: {
    list: asyncHandler(async (_req, res) => ok(res, await s.listCategories())),
    create: asyncHandler(async (req, res) => created(res, await s.createCategory(req.body))),
    update: asyncHandler(async (req, res) => ok(res, await s.updateCategory(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => { await s.deleteCategory(req.params.id); noContent(res); }),
  },
  banners: {
    list: asyncHandler(async (_req, res) => ok(res, await s.listBanners())),
    create: asyncHandler(async (req, res) => created(res, await s.createBanner(req.body))),
    update: asyncHandler(async (req, res) => ok(res, await s.updateBanner(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => { await s.deleteBanner(req.params.id); noContent(res); }),
  },
    colours: {
    list: asyncHandler(async (_req, res) => ok(res, await s.listColours())),
    create: asyncHandler(async (req, res) => created(res, await s.createColour(req.body))),
    update: asyncHandler(async (req, res) => ok(res, await s.updateColour(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => { await s.deleteColour(req.params.id); noContent(res); }),
  },
};