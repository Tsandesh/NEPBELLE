import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import { orderService } from '../services/order.service.js';

export const orderController = {
  paymentInfo: asyncHandler(async (_req, res) => ok(res, { payId: env.PAYID_VALUE, accountName: env.PAYID_ACCOUNT_NAME, codMaxCents: env.COD_MAX_TOTAL_CENTS })),
  reference: asyncHandler(async (req, res) => ok(res, { reference: await orderService.reference(req.user!.id) })),
  place: asyncHandler(async (req, res) => created(res, await orderService.place(req.user!.id, req.body, req.file))),
  list: asyncHandler(async (req, res) => ok(res, await orderService.list(req.user!.id))),
  get: asyncHandler(async (req, res) => ok(res, await orderService.get(req.user!.id, req.params.id))),
  track: asyncHandler(async (req, res) => ok(res, await orderService.track(req.body.orderNumber, req.body.email))),
  resubmitProof: asyncHandler(async (req, res) => ok(res, await orderService.resubmitProof(req.user!.id, req.params.id, req.file, req.body.payidReceiptNumber))),
  requestExchange: asyncHandler(async (req, res) => ok(res, await orderService.requestExchange(req.user!.id, req.params.id, req.body.reason))),
};