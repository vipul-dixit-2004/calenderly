import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users, availabilitySchedules, availabilityRules, eventTypes } from '../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { AppError } from '../errors/AppError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'calenderly-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper: set JWT as HTTP-only cookie
function setTokenCookie(res, userId) {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',   // 'none' required for cross-subdomain in prod
        secure: isProd,                       // must be true when sameSite is 'none'
        maxAge: 7 * 24 * 60 * 60 * 1000,     // 7 days
    });
    return token;
}

// Helper: strip passwordHash before returning user
function safeUser(user) {
    const { passwordHash, ...rest } = user;
    return rest;
}

// Helper: auto-setup for new users (default schedule + starter event type)
async function setupNewUser(userId, timezone = 'Asia/Kolkata') {
    // 1. Default availability schedule
    const [schedule] = await db.insert(availabilitySchedules).values({
        userId,
        name: 'Working Hours',
        timezone,
        isDefault: true,
    }).returning();

    // 2. Mon–Fri 9am–5pm
    await db.insert(availabilityRules).values([
        { scheduleId: schedule.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    ]);

    // 3. Starter event type
    await db.insert(eventTypes).values({
        userId,
        title: '30-Minute Meeting',
        slug: '30-min',
        duration: 30,
        description: 'A standard 30-minute meeting.',
        meetType: 'google_meet',
        color: '#006BFF',
    });
}

// POST /api/auth/signup
export const signup = async (req, res, next) => {
    try {
        const { name, email, username, password, timezone } = req.body;
        const userTimezone = (timezone && typeof timezone === 'string' && timezone.trim()) ? timezone.trim() : 'Asia/Kolkata';

        // Validate required fields
        if (!name?.trim() || !email?.trim() || !username?.trim() || !password) {
            throw new AppError('name, email, username, and password are required', 400);
        }
        if (password.length < 6) {
            throw new AppError('Password must be at least 6 characters', 400);
        }
        if (!/^[a-z0-9_-]+$/i.test(username)) {
            throw new AppError('Username can only contain letters, numbers, hyphens, and underscores', 400);
        }

        // Check uniqueness
        const existing = await db
            .select({ id: users.id, email: users.email, username: users.username })
            .from(users)
            .where(or(eq(users.email, email.toLowerCase()), eq(users.username, username.toLowerCase())));

        if (existing.length > 0) {
            const conflict = existing[0].email === email.toLowerCase() ? 'email' : 'username';
            throw new AppError(`That ${conflict} is already taken`, 409);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [user] = await db.insert(users).values({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            username: username.toLowerCase().trim(),
            passwordHash,
            timezone: userTimezone,
        }).returning();

        // Auto-setup default schedule and starter event type
        await setupNewUser(user.id, userTimezone);

        setTokenCookie(res, user.id);
        res.status(201).json({ user: safeUser(user) });
    } catch (err) { next(err); }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            throw new AppError('email and password are required', 400);
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase().trim()));

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new AppError('Invalid email or password', 401);
        }

        setTokenCookie(res, user.id);
        res.json({ user: safeUser(user) });
    } catch (err) { next(err); }
};

// POST /api/auth/logout
export const logout = (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
    });
    res.json({ success: true });
};

// GET /api/auth/me  (protected by requireAuth middleware)
export const me = async (req, res, next) => {
    try {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId));

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: safeUser(user) });
    } catch (err) { next(err); }
};
