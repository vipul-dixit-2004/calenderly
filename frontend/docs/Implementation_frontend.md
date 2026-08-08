# Calendly Clone — Required Pages & Theme Specification

## Project Goal
Build a simplified Calendly-style scheduling platform based strictly on the assignment requirements.

The focus should be:
- Clean Calendly-like UI
- Functional scheduling flow
- Proper booking logic
- Good database design
- Responsive layout

DO NOT build unnecessary enterprise-level features.

---

# Required Pages

## 1. Dashboard / Event Types Page

### Route
```txt
/event-types
```

### Purpose
Manage scheduling event types.

### Features Required
- Create event type
- Edit event type
- Delete event type
- List all event types

### Required Fields
```txt
Event Name
Duration (minutes)
URL Slug
```

### UI Layout
```txt
------------------------------------------------
| Event Card                                     |
| 30 Minute Meeting                              |
| calendlyclone.com/book/30-min-meeting          |
| Duration: 30 mins                              |
| [Edit] [Delete]                                |
------------------------------------------------
```

### UI Components Needed
- Event cards
- Create event modal
- Edit modal
- Delete confirmation dialog
- Buttons
- Input fields

### Design Style
- White background
- Rounded cards
- Thin borders
- Minimal shadows
- Spacious layout

---

# 2. Availability Settings Page

### Route
```txt
/availability
```

### Purpose
Configure weekly availability.

### Features Required
- Select weekdays
- Support multiple time slots per day (add/remove intervals)
- Set timezone

### Example UI
```txt
Monday      9:00 AM - 5:00 PM
Tuesday     9:00 AM - 5:00 PM
Wednesday   9:00 AM - 5:00 PM
```

### Components Needed
- Day toggles
- Time pickers
- Timezone dropdown
- Save button

### DO NOT BUILD
- Team schedules
- Multiple schedule profiles
- Advanced recurrence

---

# 3. Public Booking Page

### Route
```txt
/book/[slug]
```

### Purpose
Allow invitees to book a meeting.

### Layout Structure
```txt
------------------------------------------------
| LEFT PANEL | CALENDAR | TIME SLOTS           |
------------------------------------------------
```

---

## Left Panel

### Show
```txt
Profile Avatar
Host Name
Event Name
Duration
Timezone
Description
```

---

## Calendar Section

### Features
- Month view calendar
- Disable unavailable dates
- Highlight selected date

---

## Time Slot Section

### Features
- Show available slots
- Disable booked slots
- Select slot interaction

### Example
```txt
9:00 AM
9:30 AM
10:00 AM
```

---

## Booking Form

### Required Fields
```txt
Invitee Name
Invitee Email
```

### Buttons
```txt
Confirm Booking
```

---

## Required Booking Logic

### Must Support
- Slot generation
- Timezone handling
- Prevent double booking
- Dynamic slot updates

---

# 4. Booking Confirmation Page

### Route
```txt
/book/[slug]/confirm
```

### Purpose
Show successful booking confirmation.

### Display
```txt
Meeting Confirmed
Date
Time
Invitee Name
Invitee Email
```

### Optional
- Add to calendar
- Meeting link

---

# 5. Meetings Page

### Route
```txt
/meetings
```

### Purpose
Manage scheduled meetings.

### Tabs
```txt
Upcoming
Past
```

### Features Required
- List meetings
- Cancel meeting
- Reschedule meeting (generates a Calendly-style link to update the time)

### Meeting Card Example
```txt
30 Min Meeting
May 22, 2026
9:30 AM
john@example.com
[Reschedule] [Cancel]
```

---

# Theme Specification

## Design Goal
The application should visually resemble Calendly.

Focus on:
- Minimal design
- High whitespace
- Smooth spacing
- Rounded components
- Professional SaaS UI

---

# Color Palette

## Primary
```txt
#006BFF
```

## Background
```txt
#FFFFFF
```

## Secondary Background
```txt
#F8FAFC
```

## Text Primary
```txt
#0F172A
```

## Text Secondary
```txt
#64748B
```

## Border
```txt
#E2E8F0
```

## Success
```txt
#16A34A
```

## Error
```txt
#DC2626
```

---

# Typography

## Recommended Fonts
- Inter
- Geist
- SF Pro

## Font Sizes
```txt
12px  Small labels
14px  Body text
16px  Buttons
20px  Card titles
32px  Page headers
```

---

# Component Design Rules

## Buttons
- Rounded-lg
- Medium font weight
- Blue primary CTA
- Hover transitions

---

## Cards
- White background
- Border radius: 16px
- Thin gray border
- Soft shadow

---

## Inputs
- Height: 44px+
- Rounded borders
- Subtle focus ring

---

## Time Slot Buttons
- Large clickable area
- Strong selected state
- Disabled unavailable slots

---

# Responsive Design Rules

## Mobile
- Stack layout vertically
- Full width buttons
- Sticky booking CTA

## Tablet/Desktop
- 3-column booking layout
- Fixed side panels

---

# Required UI Components

## Must Build
- Navbar
- Sidebar
- Calendar
- Time slot selector
- Form inputs
- Buttons
- Modal dialogs
- Meeting cards
- Tabs
- Toast notifications

---

# Features to Completely Avoid

DO NOT BUILD:
- Authentication
- Team scheduling
- Round robin scheduling
- Payments
- Analytics
- AI scheduling
- CRM integrations
- Workflow automation
- White labeling
- Embed widgets

---

# Recommended Tech Stack

## Frontend
- Next.js 14 (App Router)
- React
- TailwindCSS

## Backend
- Node.js
- Express.js

## Database
- Neon PostgreSQL

## ORM
- Drizzle ORM (`drizzle-orm` + `drizzle-kit`)

## DB Driver
- `@neondatabase/serverless`

---

# Recommended Folder Structure

```txt
calendly-clone/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js
│   │   │   ├── schema.js
│   │   │   └── seed.js
│   │   ├── routes/
│   │   │   ├── users.js
│   │   │   ├── eventTypes.js
│   │   │   ├── availability.js
│   │   │   ├── bookings.js
│   │   │   └── meetings.js
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   ├── eventTypeController.js
│   │   │   ├── availabilityController.js
│   │   │   ├── bookingController.js
│   │   │   └── meetingController.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── app.js
│   ├── drizzle.config.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.js
    │   ├── page.js
    │   ├── event-types/
    │   │   ├── page.js
    │   │   └── [id]/edit/page.js
    │   ├── availability/page.js
    │   ├── meetings/page.js
    │   └── [username]/[slug]/
    │       ├── page.js
    │       └── confirmed/page.js
    ├── components/
    │   ├── layout/
    │   ├── event-types/
    │   ├── booking/
    │   └── meetings/
    ├── lib/
    │   └── api.js
    └── package.json
```

---

# Backend + Frontend Architecture Notes

## Backend Responsibilities

### Users Module
- Get default user
- Update profile and timezone

### Event Types Module
- CRUD event types
- Toggle active/inactive state
- Public slug support

### Availability Module
- Weekly availability rules
- Timezone updates
- Date-specific overrides

### Booking Module
- Public event lookup
- Generate available slots
- Prevent double booking
- Create meetings

### Meetings Module
- Upcoming meetings
- Past meetings
- Cancel meeting flow

---

## Frontend Responsibilities

### Dashboard
- Event type cards
- Create/edit/delete actions

### Availability UI
- Weekly schedule editor
- Time pickers
- Timezone selector

### Booking UI
- Calendar picker
- Time slot selection
- Booking form
- Confirmation screen

### Meetings UI
- Upcoming/past tabs
- Meeting cards
- Cancel action

---

## API Structure

### Event Types
```txt
GET    /api/event-types
POST   /api/event-types
PUT    /api/event-types/:id
DELETE /api/event-types/:id
```

### Availability
```txt
GET  /api/availability
PUT  /api/availability/rules
PUT  /api/availability/timezone
```

### Public Booking
```txt
GET  /api/bookings/:username/:slug
GET  /api/bookings/:username/:slug/slots
POST /api/bookings/:username/:slug
```

### Meetings
```txt
GET   /api/meetings
PATCH /api/meetings/:id/cancel
```

---

## Important Backend Logic

### Slot Generation
- Read availability rules
- Generate slots using event duration
- Remove booked slots
- Return available ISO timestamps

### Double Booking Prevention
Check overlapping intervals before inserting:

```txt
existing.startTime < newEndTime
AND
existing.endTime > newStartTime
```

### Timezone Handling
- Store timestamps in UTC
- Convert on frontend display
- Maintain schedule timezone separately

---

# Core Engineering Priorities

## Highest Priority
1. Calendly-like UI
2. Booking flow
3. Slot generation
4. Prevent double booking
5. Proper database schema

---

# Suggested Development Timeline

## Day 1
- Database schema
- Event types CRUD
- Availability page
- Booking logic

## Day 2
- Meetings page
- UI polish
- Responsive design
- Deployment

---

# Final Product Goal

The final application should feel like:

> A polished lightweight Calendly clone MVP with clean UI and functional scheduling flow.

