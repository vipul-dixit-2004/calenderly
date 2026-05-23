import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { runAgent } from '../services/ai/index.js';

export const chat = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ error: 'x-user-id header required' });

    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { reply, toolCalls } = await runAgent({
      ctx: { user },
      history,
      userMessage: message,
    });

    res.json({ reply, toolCalls });
  } catch (err) {
    next(err);
  }
};
