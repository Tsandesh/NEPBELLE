import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { wishlistService } from '../services/wishlist.service.js';

export const wishlistController = {
  list: asyncHandler(async (req, res) => ok(res, await wishlistService.list(req.user!.id))),
  add: asyncHandler(async (req, res) => ok(res, await wishlistService.add(req.user!.id, req.params.id))),
  remove: asyncHandler(async (req, res) => ok(res, await wishlistService.remove(req.user!.id, req.params.id))),
};
