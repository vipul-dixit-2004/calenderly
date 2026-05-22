import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getMe = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) { next(err); }
};

export const updateMe = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { name, email, username, timezone } = req.body;
        const [updated] = await db
            .update(users)
            .set({ name, email, username, timezone, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();

        res.json(updated);
    } catch (err) { next(err); }
};