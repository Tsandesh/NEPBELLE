import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import { orderService } from '../services/order.service.js';

export const orderController = {
  place: asyncHandler(async (req, res) => created(res, await orderService.place(req.user!.id, req.body))),
  list: asyncHandler(async (req, res) => ok(res, await orderService.list(req.user!.id))),
  get: asyncHandler(async (req, res) => ok(res, await orderService.get(req.user!.id, req.params.id))),
  track: asyncHandler(async (req, res) => ok(res, await orderService.track(req.body.orderNumber, req.body.email))),
};
