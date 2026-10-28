import { asyncHandler } from '../utils/asyncHandler.js';
import { created, noContent, ok } from '../utils/apiResponse.js';
import { userService } from '../services/user.service.js';

export const userController = {
  update: asyncHandler(async (req, res) => ok(res, await userService.updateProfile(req.user!.id, req.body))),
  addresses: asyncHandler(async (req, res) => ok(res, await userService.addresses(req.user!.id))),
  addAddress: asyncHandler(async (req, res) => created(res, await userService.addAddress(req.user!.id, req.body))),
  deleteAddress: asyncHandler(async (req, res) => { await userService.deleteAddress(req.user!.id, req.params.id); noContent(res); }),
};
