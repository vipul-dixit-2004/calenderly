import { AppError } from '../errors/AppError.js';
import { mapDbError } from '../errors/dbErrors.js';

const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Central Express error-handling middleware.
 *
 * Decision tree:
 *   1. Already an AppError  → it's operational; expose its message safely in both envs.
 *   2. Recognised DB error  → map to a safe AppError, same as above.
 *   3. JWT errors           → map to 401 AppError.
 *   4. Everything else      → programming / unknown error:
 *        • DEV:  expose the real message + stack for fast debugging
 *        • PROD: generic "Something went wrong" — never leak internals
 *
 * Always logs to the server console so ops/developers can see the full trace.
 */
export default function errorHandler(err, req, res, next) {
    // ── 1. Always log the full error on the server ──────────────────────────
    if (IS_DEV) {
        console.error('\n❌ Error:', err.stack || err);
    } else {
        // In prod log only essential info (no stack to stdout to keep logs clean)
        console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err.message);
    }

    // ── 2. AppError — operational, safe to expose ───────────────────────────
    if (err.isOperational) {
        return res.status(err.statusCode).json(buildResponse(err, false));
    }

    // ── 3. Known DB constraint errors → map to AppError ─────────────────────
    const mapped = mapDbError(err);
    if (mapped) {
        return res.status(mapped.statusCode).json(buildResponse(mapped, false));
    }

    // ── 4. JWT errors ─────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired — please sign in again' });
    }

    // ── 5. SyntaxError from express.json() (malformed JSON body) ────────────
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }

    // ── 6. Unknown / programming error ───────────────────────────────────────
    if (IS_DEV) {
        // Development: expose everything so you can fix it fast
        return res.status(500).json({
            error: err.message || 'Internal Server Error',
            type: err.name,
            stack: err.stack?.split('\n').slice(0, 8), // first 8 frames
        });
    }

    // Production: never leak internals
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
}

// ── Helper ───────────────────────────────────────────────────────────────────
function buildResponse(appError, includeStack) {
    const body = { error: appError.message };
    if (includeStack && IS_DEV && appError.stack) {
        body.stack = appError.stack.split('\n').slice(0, 6);
    }
    return body;
}