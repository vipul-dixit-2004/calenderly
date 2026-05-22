import {
    pgTable, uuid, varchar, text, integer, smallint,
    boolean, timestamp, time, date, uniqueIndex, index,
    check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';


export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});


export const eventTypes = pgTable('event_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 150 }).notNull(),
    slug: varchar('slug', { length: 150 }).notNull(),
    duration: integer('duration').notNull(),               // minutes
    description: text('description'),
    color: varchar('color', { length: 20 }).default('#0069ff'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    userSlugUnique: uniqueIndex('uq_event_types_user_slug').on(t.userId, t.slug),
    userIdIdx: index('idx_event_types_user').on(t.userId),
    slugIdx: index('idx_event_types_slug').on(t.slug),
}));


export const availabilitySchedules = pgTable('availability_schedules', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull().default('Working Hours'),
    timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
    isDefault: boolean('is_default').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});


export const availabilityRules = pgTable('availability_rules', {
    id: uuid('id').defaultRandom().primaryKey(),
    scheduleId: uuid('schedule_id').notNull().references(() => availabilitySchedules.id, { onDelete: 'cascade' }),
    dayOfWeek: smallint('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
}, (t) => ({
    scheduleDayUnique: uniqueIndex('uq_availability_rules_schedule_day').on(t.scheduleId, t.dayOfWeek),
}));


export const availabilityOverrides = pgTable('availability_overrides', {
    id: uuid('id').defaultRandom().primaryKey(),
    scheduleId: uuid('schedule_id').notNull().references(() => availabilitySchedules.id, { onDelete: 'cascade' }),
    overrideDate: date('override_date').notNull(),
    isUnavailable: boolean('is_unavailable').notNull().default(false),
    startTime: time('start_time'),
    endTime: time('end_time'),
}, (t) => ({
    scheduleDateUnique: uniqueIndex('uq_availability_overrides_schedule_date').on(t.scheduleId, t.overrideDate),
}));


export const meetings = pgTable('meetings', {
    id: uuid('id').defaultRandom().primaryKey(),
    eventTypeId: uuid('event_type_id').notNull().references(() => eventTypes.id, { onDelete: 'cascade' }),
    inviteeName: varchar('invitee_name', { length: 150 }).notNull(),
    inviteeEmail: varchar('invitee_email', { length: 255 }).notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('scheduled'),
    cancelReason: text('cancel_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    eventTypeIdx: index('idx_meetings_event_type').on(t.eventTypeId),
    startTimeIdx: index('idx_meetings_start_time').on(t.startTime),
    statusIdx: index('idx_meetings_status').on(t.status),
}));


export const usersRelations = relations(users, ({ many }) => ({
    eventTypes: many(eventTypes),
    availabilitySchedules: many(availabilitySchedules),
}));

export const eventTypesRelations = relations(eventTypes, ({ one, many }) => ({
    user: one(users, { fields: [eventTypes.userId], references: [users.id] }),
    meetings: many(meetings),
}));

export const availabilitySchedulesRelations = relations(availabilitySchedules, ({ one, many }) => ({
    user: one(users, { fields: [availabilitySchedules.userId], references: [users.id] }),
    rules: many(availabilityRules),
    overrides: many(availabilityOverrides),
}));

export const availabilityRulesRelations = relations(availabilityRules, ({ one }) => ({
    schedule: one(availabilitySchedules, {
        fields: [availabilityRules.scheduleId],
        references: [availabilitySchedules.id],
    }),
}));

export const availabilityOverridesRelations = relations(availabilityOverrides, ({ one }) => ({
    schedule: one(availabilitySchedules, {
        fields: [availabilityOverrides.scheduleId],
        references: [availabilitySchedules.id],
    }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
    eventType: one(eventTypes, {
        fields: [meetings.eventTypeId],
        references: [eventTypes.id],
    }),
}));