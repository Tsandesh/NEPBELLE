import type { CookieOptions, Request, Response } from 'express';
import { env, isProd } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, noContent, ok } from '../utils/apiResponse.js';
import { authService } from '../services/auth.service.js';

const COOKIE = 'nb_rt';
const cookieOpts: CookieOptions = {
  httpOnly: true, secure: isProd, sameSite: 'lax', path: '/api/v1/auth', maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86400_000,
};
const respond = (res: Response, r: { user: unknown; accessToken: string; refreshToken: string }, status = 200) => {
  res.cookie(COOKIE, r.refreshToken, cookieOpts);
  return status === 201 ? created(res, { user: r.user, accessToken: r.accessToken }) : ok(res, { user: r.user, accessToken: r.accessToken });
};

export const authController = {
  register: asyncHandler(async (req, res) => respond(res, await authService.register(req.body), 201)),
  login: asyncHandler(async (req, res) => respond(res, await authService.login(req.body.email, req.body.password))),
  refresh: asyncHandler(async (req: Request, res) => respond(res, await authService.refresh(req.cookies?.[COOKIE]))),
  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.cookies?.[COOKIE]);
    res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined });
    noContent(res);
  }),
  me: asyncHandler(async (req, res) => ok(res, await authService.me(req.user!.id))),
};
