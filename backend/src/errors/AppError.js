export class AppError extends Error {
    /**
     * @param {string} message   Human-readable message (safe to show the user)
     * @param {number} statusCode HTTP status code (default 400)
     */
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = true; // flag: we expected this, safe to expose
        Error.captureStackTrace(this, this.constructor);
    }
}

// ─── Convenience factory helpers ──────────────────────────────────────────────

export const notFound = (msg = 'Not found') => new AppError(msg, 404);
export const badRequest = (msg = 'Bad request') => new AppError(msg, 400);
export const unauthorized = (msg = 'Not authenticated') => new AppError(msg, 401);
export const forbidden = (msg = 'Forbidden') => new AppError(msg, 403);
export const conflict = (msg = 'Conflict') => new AppError(msg, 409);
export const serverError = (msg = 'Internal server error') => new AppError(msg, 500);
