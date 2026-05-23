import { db } from '../db/index.js';
import { eventTypes } from '../db/schema.js';
import { eq, and, like } from 'drizzle-orm';

async function generateUniqueSlug(baseSlug, userId, excludeId = null) {
    const rows = await db
        .select({ slug: eventTypes.slug })
        .from(eventTypes)
        .where(and(
            eq(eventTypes.userId, userId),
            like(eventTypes.slug, `${baseSlug}%`),
        ));

    const existing = new Set(rows.map(r => r.slug));

    if (!existing.has(baseSlug)) return baseSlug;

    // If we're updating, the current record's slug doesn't count as a conflict
    if (excludeId) {
        const [current] = await db
            .select({ slug: eventTypes.slug })
            .from(eventTypes)
            .where(eq(eventTypes.id, excludeId));
        if (current?.slug === baseSlug) return baseSlug;
    }

    let counter = 1;
    while (existing.has(`${baseSlug}-${counter}`)) counter++;
    return `${baseSlug}-${counter}`;
}

export const list = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const rows = await db
            .select()
            .from(eventTypes)
            .where(eq(eventTypes.userId, userId))
            .orderBy(eventTypes.createdAt);
        res.json(rows);
    } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { title, slug, duration, description, color, meetType, meetUrl } = req.body;
        const uniqueSlug = await generateUniqueSlug(slug, userId);
        const [row] = await db
            .insert(eventTypes)
            .values({ userId, title, slug: uniqueSlug, duration, description, color, meetType, meetUrl })
            .returning();
        res.status(201).json(row);
    } catch (err) { next(err); }
};

export const getOne = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const [row] = await db
            .select()
            .from(eventTypes)
            .where(and(
                eq(eventTypes.id, req.params.id),
                eq(eventTypes.userId, userId),
            ));
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { title, slug, duration, description, color, meetType, meetUrl } = req.body;
        const uniqueSlug = await generateUniqueSlug(slug, userId, req.params.id);
        const [row] = await db
            .update(eventTypes)
            .set({ title, slug: uniqueSlug, duration, description, color, meetType, meetUrl, updatedAt: new Date() })
            .where(and(
                eq(eventTypes.id, req.params.id),
                eq(eventTypes.userId, userId),
            ))
            .returning();
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        await db
            .delete(eventTypes)
            .where(and(
                eq(eventTypes.id, req.params.id),
                eq(eventTypes.userId, userId),
            ));
        res.status(204).send();
    } catch (err) { next(err); }
};

export const toggle = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        // First fetch current state, then flip it
        const [current] = await db
            .select({ isActive: eventTypes.isActive })
            .from(eventTypes)
            .where(and(
                eq(eventTypes.id, req.params.id),
                eq(eventTypes.userId, userId),
            ));
        if (!current) return res.status(404).json({ error: 'Not found' });

        const [row] = await db
            .update(eventTypes)
            .set({ isActive: !current.isActive, updatedAt: new Date() })
            .where(eq(eventTypes.id, req.params.id))
            .returning();
        res.json(row);
    } catch (err) { next(err); }
};