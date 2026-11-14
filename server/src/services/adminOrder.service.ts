import { TRANSITIONS } from '../domain/orderWorkflow.js';
import { adminOrderRepository, type AdminOrderFilter } from '../repositories/adminOrder.repository.js';
import { AppError } from '../utils/AppError.js';

export const adminOrderService = {
  async list(f: AdminOrderFilter) {
    const { items, total } = await adminOrderRepository.list(f);
    return {
      items: items.map(({ _count, ...o }) => ({ ...o, itemCount: _count.items })),
      meta: { page: f.page, limit: f.limit, total, totalPages: Math.max(1, Math.ceil(total / f.limit)) },
    };
  },
  summary: () => adminOrderRepository.summary(),

  async get(id: string) {
    const o = await adminOrderRepository.findDetail(id);
    if (!o) throw AppError.notFound('Order not found');
    const dup = o.payidReceiptNumber ? await adminOrderRepository.sameReceipt(o.payidReceiptNumber, o.id) : [];
    const { paymentProofFile, ...rest } = o; // never expose the internal file name
    return { ...rest, hasProof: !!paymentProofFile, duplicateReceipt: dup.map((d) => d.orderNumber), allowedNext: TRANSITIONS[o.status] };
  },

  async proofFile(id: string) {
    const o = await adminOrderRepository.findDetail(id);
    if (!o?.paymentProofFile) throw AppError.notFound('No payment screenshot for this order');
    return o.paymentProofFile;
  },

  async addNote(id: string, note: string, actor: string) {
    const o = await adminOrderRepository.findDetail(id);
    if (!o) throw AppError.notFound('Order not found');
    await adminOrderRepository.addNote(id, o.status, note, actor);
  },
};