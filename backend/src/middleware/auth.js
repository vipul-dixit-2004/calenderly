import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'calenderly-dev-secret';

/**
 * Auth middleware — reads JWT from HTTP-only cookie, verifies it,
 * and sets req.userId so downstream controllers can use it.
 */
export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
