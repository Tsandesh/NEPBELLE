import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { cartService } from '../services/cart.service.js';

export const cartController = {
  get: asyncHandler(async (req, res) => ok(res, await cartService.get(req.user!.id))),
  add: asyncHandler(async (req, res) => ok(res, await cartService.add(req.user!.id, req.body.variantId, req.body.quantity))),
  update: asyncHandler(async (req, res) => ok(res, await cartService.setQuantity(req.user!.id, req.params.id, req.body.quantity))),
  remove: asyncHandler(async (req, res) => ok(res, await cartService.remove(req.user!.id, req.params.id))),
  merge: asyncHandler(async (req, res) => ok(res, await cartService.merge(req.user!.id, req.body.items))),
};
