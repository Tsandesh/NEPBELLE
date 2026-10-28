export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
  static badRequest(msg: string, details?: unknown) { return new AppError(400, 'BAD_REQUEST', msg, details); }
  static unauthorized(msg = 'Authentication required') { return new AppError(401, 'UNAUTHORIZED', msg); }
  static forbidden(msg = 'Forbidden') { return new AppError(403, 'FORBIDDEN', msg); }
  static notFound(msg = 'Not found') { return new AppError(404, 'NOT_FOUND', msg); }
  static conflict(msg: string) { return new AppError(409, 'CONFLICT', msg); }
}
