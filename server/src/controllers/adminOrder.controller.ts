import { asyncHandler } from '../utils/asyncHandler.js';
import { noContent, ok } from '../utils/apiResponse.js';
import { userRepository } from '../repositories/user.repository.js';
import { adminOrderService } from '../services/adminOrder.service.js';
import { orderWorkflowService } from '../services/orderWorkflow.service.js';
import { uploadService } from '../services/upload.service.js';

const actorOf = async (id: string) => (await userRepository.findById(id))?.email ?? id; // recorded in the order history

export const adminOrderController = {
  list: asyncHandler(async (req, res) => { const { items, meta } = await adminOrderService.list(req.query as any); ok(res, items, meta); }),
  summary: asyncHandler(async (_req, res) => ok(res, await adminOrderService.summary())),
  get: asyncHandler(async (req, res) => ok(res, await adminOrderService.get(req.params.id))),
  proof: asyncHandler(async (req, res) => {
    const file = await adminOrderService.proofFile(req.params.id);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    await new Promise<void>((resolve, reject) => res.sendFile(uploadService.privatePath(file), (err) => (err ? reject(err) : resolve())));
  }),
  status: asyncHandler(async (req, res) => { await orderWorkflowService.changeStatus(req.params.id, req.body, await actorOf(req.user!.id)); ok(res, await adminOrderService.get(req.params.id)); }),
  payment: asyncHandler(async (req, res) => { await orderWorkflowService.paymentAction(req.params.id, req.body, await actorOf(req.user!.id)); ok(res, await adminOrderService.get(req.params.id)); }),
  note: asyncHandler(async (req, res) => { await adminOrderService.addNote(req.params.id, req.body.note, await actorOf(req.user!.id)); noContent(res); }),
};