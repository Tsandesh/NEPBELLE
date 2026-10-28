import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { siteService } from '../services/site.service.js';

export const siteController = { home: asyncHandler(async (_req, res) => ok(res, await siteService.home())) };