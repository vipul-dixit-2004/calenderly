import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Helper: strip passwordHash before returning user
function safeUser(user) {
    const { passwordHash, ...rest } = user;
    return rest;
}

export const getMe = async (req, res, next) => {
    try {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId));

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(safeUser(user));
    } catch (err) { next(err); }
};

export const updateMe = async (req, res, next) => {
    try {
        const { name, email, username, timezone } = req.body;
        const [updated] = await db
            .update(users)
            .set({ name, email, username, timezone, updatedAt: new Date() })
            .where(eq(users.id, req.userId))
            .returning();

        res.json(safeUser(updated));
    } catch (err) { next(err); }
};