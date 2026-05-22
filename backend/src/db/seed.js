import 'dotenv/config';
import { db } from './index.js';
import {
    users, eventTypes, availabilitySchedules,
    availabilityRules, meetings,
} from './schema.js';

async function seed() {
    console.log('Seeding...');

    // 1. Default user
    const [user] = await db.insert(users).values({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Vipul Dixit',
        email: 'vipul05@gmail.com',
        username: 'vipul05',
        timezone: 'Asia/Kolkata',
    }).returning();

    // 2. Event types
    const insertedEventTypes = await db.insert(eventTypes).values([
        {
            userId: user.id, title: '15-Minute Quick Chat', slug: 'quick-chat', duration: 15,
            description: 'A quick intro or check-in.', color: '#0069ff'
        },
        {
            userId: user.id, title: '30-Minute Meeting', slug: '30-min', duration: 30,
            description: 'Standard 30-minute discussion.', color: '#7c3aed'
        },
        {
            userId: user.id, title: '60-Minute Deep Dive', slug: '60-min', duration: 60,
            description: 'In-depth strategy or review session.', color: '#059669'
        },
    ]).returning();

    // 3. Default availability schedule
    const [schedule] = await db.insert(availabilitySchedules).values({
        userId: user.id,
        name: 'Working Hours',
        timezone: 'America/New_York',
        isDefault: true,
    }).returning();

    // 4. Mon–Fri 9–5
    await db.insert(availabilityRules).values([
        { scheduleId: schedule.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { scheduleId: schedule.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    ]);

    // 5. Sample meetings
    const now = new Date();
    await db.insert(meetings).values([
        {
            eventTypeId: insertedEventTypes[0].id,
            inviteeName: 'Sarah Lee',
            inviteeEmail: 'sarah@example.com',
            startTime: new Date(now.getTime() + 2 * 86400000),
            endTime: new Date(now.getTime() + 2 * 86400000 + 15 * 60000),
            status: 'scheduled',
        },
        {
            eventTypeId: insertedEventTypes[1].id,
            inviteeName: 'Tom Hanks',
            inviteeEmail: 'tom@example.com',
            startTime: new Date(now.getTime() + 3 * 86400000),
            endTime: new Date(now.getTime() + 3 * 86400000 + 30 * 60000),
            status: 'scheduled',
        },
        {
            eventTypeId: insertedEventTypes[1].id,
            inviteeName: 'Past Booking',
            inviteeEmail: 'past@example.com',
            startTime: new Date(now.getTime() - 5 * 86400000),
            endTime: new Date(now.getTime() - 5 * 86400000 + 30 * 60000),
            status: 'completed',
        },
    ]);

    console.log('Seed complete.');
    process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });