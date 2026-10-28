import { userRepository } from '../repositories/user.repository.js';

export const userService = {
  updateProfile: (id: string, data: { firstName?: string; lastName?: string; phone?: string }) => userRepository.update(id, data),
  addresses: (id: string) => userRepository.addresses(id),
  addAddress: (id: string, data: unknown) => userRepository.createAddress(id, data),
  deleteAddress: (id: string, addressId: string) => userRepository.deleteAddress(id, addressId),
};
