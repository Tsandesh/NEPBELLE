import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';

const TTL = env.REFRESH_TOKEN_TTL_DAYS * 86400;
const rtKey = (userId: string, jti: string) => `rt:${userId}:${jti}`;

const publicUser = (u: { id: string; email: string; firstName: string; lastName: string; phone: string | null; role: string }) =>
  ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, phone: u.phone, role: u.role });

async function issueTokens(user: { id: string; role: 'CUSTOMER' | 'ADMIN' }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const { token: refreshToken, jti } = signRefreshToken(user.id);
  await redis.set(rtKey(user.id, jti), '1', 'EX', TTL); // server-side session record
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: { email: string; password: string; firstName: string; lastName: string }) {
    if (await userRepository.findByEmail(input.email)) throw AppError.conflict('An account with this email already exists.');
    const user = await userRepository.create({ ...input, passwordHash: await hashPassword(input.password) });
    return { user: publicUser(user), ...(await issueTokens(user)) };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    // Same error for unknown email / bad password to avoid account enumeration
    if (!user || !(await verifyPassword(password, user.passwordHash))) throw AppError.unauthorized('Incorrect email or password.');
    return { user: publicUser(user), ...(await issueTokens(user)) };
  },

  /** Rotating refresh tokens: old jti is deleted; reuse of a consumed token is rejected. */
  async refresh(token?: string) {
    if (!token) throw AppError.unauthorized('No refresh token');
    let payload;
    try { payload = verifyRefreshToken(token); } catch { throw AppError.unauthorized('Invalid refresh token'); }
    const deleted = await redis.del(rtKey(payload.sub, payload.jti));
    if (!deleted) throw AppError.unauthorized('Session expired');
    const user = await userRepository.findById(payload.sub);
    if (!user) throw AppError.unauthorized();
    return { user: publicUser(user), ...(await issueTokens(user)) };
  },

  async logout(token?: string) {
    if (!token) return;
    try { const p = verifyRefreshToken(token); await redis.del(rtKey(p.sub, p.jti)); } catch { /* already invalid */ }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.unauthorized();
    return publicUser(user);
  },
};
