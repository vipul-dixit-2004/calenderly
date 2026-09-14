<div align="center">

<h1>📅 Calenderly</h1>
<p><strong>A full-stack Calendly-inspired scheduling platform</strong></p>

<p>
  <a href="https://calenderly.vipuldixit.tech"><img src="https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel" /></a>
  <a href="https://calenderly-api.vipuldixit.tech"><img src="https://img.shields.io/badge/Backend-AWS_%2B_Nginx-FF9900?style=for-the-badge&logo=amazonwebservices" /></a>
  <a href="https://neon.tech"><img src="https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat-square" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Auth-JWT_%2B_bcrypt-F59E0B?style=flat-square&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Nodemailer-Gmail_SMTP-EA4335?style=flat-square&logo=gmail" />
  <img src="https://img.shields.io/badge/Gemini_AI-Agent-4285F4?style=flat-square&logo=google" />
</p>

</div>

---

## 🌐 Live Demo

| Service | URL | Hosting |
|---------|-----|--------|
| **Frontend** | <https://calenderly.vipuldixit.tech> | Vercel |
| **Backend API** | <https://calenderly-api.vipuldixit.tech/api> | AWS EC2 + Nginx |

> **Quick test:** Visit `https://calenderly.vipuldixit.tech/vipul05/quick-chat` to book a real meeting as an invitee.

---

## 📖 Table of Contents

1. [What is Calenderly?](#-what-is-calenderly)
2. [Features](#-features)
3. [Authentication](#-authentication)
4. [AI Assistant](#-ai-assistant)
5. [How It Works](#-how-it-works)
6. [Tech Stack](#-tech-stack)
7. [Project Structure](#-project-structure)
8. [Database Schema](#-database-schema)
9. [API Reference](#-api-reference)
10. [Email Notifications](#-email-notifications)
11. [Google Meet Integration](#-google-meet-integration)
12. [Deployment](#-deployment)
13. [Local Setup](#-local-setup)
14. [Environment Variables](#-environment-variables)

---

## 🗓 What is Calenderly?

Calenderly is a **Calendly-style scheduling platform** built as a fullstack project. It allows a host to sign up, define event types, set their weekly availability, and share a public booking link. Invitees can then pick a date and time from the host's real-time availability, submit their details, and receive an automated email confirmation — all without any authentication required on the invitee side. The host dashboard is protected by JWT-based authentication using HTTP-only cookies.

---

## ✨ Features

### 🔐 Authentication

- **Sign Up / Log In / Log Out** — Full credential-based authentication with dedicated `/signup` and `/login` pages
- **HTTP-only JWT Cookies** — Tokens are stored in `HttpOnly` cookies (never in `localStorage`), protecting against XSS
- **Password Hashing** — Passwords are hashed with `bcrypt` (cost factor 12) before being stored
- **7-day Sessions** — JWTs are valid for 7 days; the session is refreshed on every page load via `GET /api/auth/me`
- **Protected API Routes** — All dashboard endpoints are guarded by the `requireAuth` middleware which validates the cookie token
- **Auto-setup on Signup** — A default Mon–Fri 9–5 availability schedule and a starter "30-Minute Meeting" event type are automatically created for every new user
- **React Auth Context** — `AuthProvider` wraps the entire app, exposing `user`, `login`, `signup`, `logout`, and `refreshUser` through a typed React context

### 🎯 Core Scheduling

![Event Types Dashboard](./frontend/public/product/eventTypes.png)

- **Event Types** — Create, edit, delete, and toggle scheduling events with custom titles, durations, colors, and URL slugs
- **Availability Settings** — Configure weekly working hours per day with support for **multiple time slots** per day (e.g. 9–12 AM and 2–5 PM)
- **Timezone Support** — Full timezone handling; availability is stored against the host's timezone and all booking times are displayed correctly to the viewer
- **Date Overrides** — Mark specific dates as unavailable or set custom hours for a particular day
- **Slot Generation** — Available slots are dynamically computed from the host's availability, slot duration, and existing bookings
- **Double-Booking Prevention** — The backend validates overlapping intervals before confirming any booking

### 📋 Meetings Management

![Meetings Dashboard](./frontend/public/product/meetings.png)

- **Upcoming / Past Tabs** — Dashboard view of all scheduled and completed meetings
- **Cancel Meeting** — Host can cancel a meeting with an optional reason
- **Reschedule Meeting** — Generates a unique reschedule link; both host and invitee can pick a new time without losing meeting context
- **Buffer Time** — Configurable buffer before/after meetings to prevent back-to-back scheduling

### 📧 Email Notifications

- **Booking Confirmation** — Sent to the invitee immediately after booking
- **Cancellation Email** — Sent to the invitee when a meeting is cancelled, including the reason
- **Reschedule Notification** — Email sent when a meeting time is updated
- **Async Queue** — All emails are processed through an in-memory queue with automatic retries (up to 3 attempts with escalating delays)

### 🤖 AI Assistant

- **Conversational Interface** — Chat with a Gemini-powered scheduling assistant directly from the dashboard
- **Schedule Q&A** — Ask natural-language questions like "What meetings do I have today?" or "Who's my next invitee?"
- **Week Summaries** — Get a concise overview of your upcoming week or any time range
- **Email Drafting** — Ask the assistant to send a reminder or follow-up email to an invitee; it always confirms before sending
- **Live Data** — The agent fetches real-time data from your database using structured tools — it never guesses or fabricates meeting details

### 🎥 Google Meet Integration

- **Auto-generated Meet Links** — A Google Meet link is asynchronously generated after booking using the Google Calendar API with a Service Account
- **Emailed to Both Parties** — Once generated, the Meet link is sent to both the host and the invitee

### 🎨 UI / UX

- **Calendly-inspired Design** — Clean white card-based layout with blue primary CTA, matching the original product's aesthetic
- **Responsive** — Works on mobile, tablet, and desktop with a collapsible sidebar and hamburger menu
- **Toast Notifications** — Real-time feedback on all actions using a reusable toast component

---

## 🔐 Authentication

Calenderly uses a **custom credential-based auth system** built with JWTs stored in HTTP-only cookies — no third-party auth providers required.

### How It Works

```
User submits email + password
         │
         ▼
POST /api/auth/login (or /signup)
         │
         ▼
Backend (authController.js)
  ├── [signup] Hash password with bcrypt (cost 12)
  ├── [signup] Insert user into DB
  ├── [signup] Auto-setup: default schedule (Mon–Fri 9–5) + starter event type
  ├── [login]  Fetch user by email → bcrypt.compare(password, hash)
  ├── Sign JWT  { userId }  →  expires in 7 days
  └── Set HTTP-only cookie  "token"  (SameSite=None + Secure in prod)
         │
         ▼
Frontend (AuthProvider.tsx)
  ├── On mount: GET /api/auth/me → populate user context
  ├── user, login(), signup(), logout(), refreshUser() exposed via React context
  └── Dashboard routes redirect to /login if unauthenticated
```

### Tech Details

| Aspect | Implementation |
|--------|---------------|
| **Token storage** | `HttpOnly` cookie — immune to XSS / `localStorage` theft |
| **Cookie flags** | `SameSite=none; Secure` in production; `SameSite=lax` in dev |
| **Password hashing** | `bcrypt` with cost factor **12** |
| **JWT lifetime** | **7 days** (configurable via `JWT_EXPIRES_IN` env var) |
| **Session check** | `GET /api/auth/me` is called on every page load from `AuthProvider` |
| **Middleware** | `requireAuth` in [`backend/src/middleware/auth.js`](backend/src/middleware/auth.js) reads the cookie, verifies the JWT, and attaches `req.userId` |

### Auth API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register a new user; returns user + sets cookie |
| `POST` | `/api/auth/login` | ❌ | Verify credentials; returns user + sets cookie |
| `POST` | `/api/auth/logout` | ❌ | Clears the auth cookie |
| `GET` | `/api/auth/me` | ✅ | Returns the currently authenticated user |

### Frontend Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `app/(auth)/login/page.tsx` | Email + password sign-in form |
| `/signup` | `app/(auth)/signup/page.tsx` | Full registration form with timezone picker, username auto-generation, and password strength indicator |

### New User Auto-Setup

When a user signs up, the backend automatically provisions:

1. **Default availability schedule** — "Working Hours" in the user's chosen timezone
2. **Mon–Fri 9 AM–5 PM rules** — five `availability_rules` rows for weekdays
3. **Starter event type** — "30-Minute Meeting" (slug: `30-min`, Google Meet)

This means every new user has a fully working scheduling page at `/{username}/30-min` immediately after signup.

---

## 🤖 AI Assistant

The AI Assistant is a **multi-step agentic chat interface** powered by Google Gemini. It lives at `/assistant` in the dashboard and lets you query your schedule using plain language.

![AI Assistant Screen](./frontend/public/product/aiscreeen.png)

### Architecture

```
User message
     │
     ▼
POST /api/ai/chat  (carries conversation history)
     │
     ▼
Agent Loop (backend/src/services/ai/agentLoop.js)
  ├── Builds a system prompt scoped to the logged-in user
  ├── Sends message + history to Gemini (gemini-3-flash-preview)
  ├── If Gemini returns function calls → execute tools in parallel
  │     ├── getMeetings      — fetch scheduled / past / today's meetings
  │     ├── getEventTypes    — fetch configured event types
  │     ├── getAvailability  — fetch weekly rules + date overrides
  │     ├── runReadOnlyQuery — run a custom SELECT query (user-scoped)
  │     └── sendEmail        — send an email to an invitee (confirm first)
  ├── Feed tool results back into the chat → repeat up to MAX_STEPS (6)
  └── Return final text reply + tool call log to frontend
     │
     ▼
ChatPanel (frontend/components/ai/ChatPanel.tsx)
  └── Renders streamed reply with markdown formatting
```

### Tools Available to the Agent

| Tool | Purpose |
|------|---------|
| `getMeetings` | Fetch meetings filtered by `upcoming`, `past`, `today`, or `this_week` |
| `getEventTypes` | List event types (optionally active-only) |
| `getAvailability` | Retrieve weekly availability rules and date overrides |
| `runReadOnlyQuery` | Execute a custom `SELECT` statement for complex aggregations |
| `sendEmail` | Send a message to an invitee (ownership-verified; confirms before sending) |

### Safety Guardrails

- All SQL queries are restricted to `SELECT` only — any mutation is rejected
- Every query is scoped to the current user's ID; cross-user data access is blocked
- The agent always asks for confirmation before sending an email, unless explicit consent was given in the same conversation
- Step budget is capped at **6 agentic loops** (`AI_AGENT_MAX_STEPS`) to prevent runaway chains

### Example Queries

> "What meetings do I have today?"  
> "Give me a summary of this week's schedule."  
> "How many meetings did I have last month?"  
> "Send a quick reminder to <alice@example.com> about tomorrow's call."

![AI Request](./frontend/public/product/ai_request.png)

![AI Response](./frontend/public/product/ai_response.png)

---

## ⚙️ How It Works

### Booking Flow (End-to-End)

```
Invitee visits:  /{username}/{slug}
       │
       ▼
1. Frontend fetches event type details from:
   GET /api/bookings/{username}/{slug}

2. Invitee picks a date on the calendar →
   Frontend fetches available slots:
   GET /api/bookings/{username}/{slug}/slots?date=YYYY-MM-DD

3. Backend computes available slots:
   a. Look up host's default availability schedule
   b. Check for date-specific overrides
   c. Walk the availability window in steps of event.duration minutes
   d. Remove already-booked slots (status = 'scheduled')
   e. Return remaining ISO timestamps

4. Invitee picks a slot, fills in name + email, submits →
   POST /api/bookings/{username}/{slug}
   { inviteeName, inviteeEmail, startTime }

5. Backend:
   a. Double-booking check (overlapping interval query)
   b. Inserts meeting into DB
   c. Queues confirmation email (async, non-blocking)
   d. Queues Google Meet link generation (async background job)

6. Invitee is redirected to:
   /{username}/{slug}/confirmed?meeting={id}

7. Background: confirmation email + Meet link delivered within seconds
```

### Slot Generation Logic

```
Availability Window (e.g., 09:00 – 17:00)
─────────────────────────────────────────────
current = 09:00
Step = event.duration (e.g. 30 min)

Candidate slots: [09:00, 09:30, 10:00, ..., 16:30]
  ─ Remove any already booked (DB check)
  ─ Remove slots that violate buffer time rules
  → Return remaining slots as ISO strings
```

### Double-Booking Check

```sql
-- A conflict exists if:
existing.startTime < newEndTime
  AND
existing.endTime > newStartTime
  AND status = 'scheduled'
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | React-based SSR/CSR hybrid |
| **Styling** | Tailwind CSS | Utility-first responsive styling |
| **Backend** | Node.js + Express.js | REST API server |
| **Database** | Neon PostgreSQL | Serverless Postgres with connection pooling |
| **ORM** | Drizzle ORM | Type-safe query builder + migrations |
| **DB Driver** | `@neondatabase/serverless` | Neon's HTTP driver for serverless environments |
| **Email** | Nodemailer + Handlebars | SMTP via Gmail App Password; HTML templates |
| **Meet Links** | Google Calendar API | Service Account OAuth2 for Meet generation |
| **AI Agent** | Google Gemini (`gemini-2.5-flash-preview`) | Multi-step agentic chat with live tool use |
| **Auth** | `jsonwebtoken` + `bcrypt` | JWT signing/verification; password hashing |
| **Session** | HTTP-only cookies (`cookie-parser`) | Stateless sessions without `localStorage` exposure |

---

## 📁 Project Structure

```
calenderly/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js               # Drizzle client (Neon HTTP driver)
│   │   │   ├── schema.js              # All table definitions + relations
│   │   │   └── seed.js                # Sample data seed script
│   │   ├── routes/
│   │   │   ├── auth.js                # POST /signup, /login, /logout; GET /me
│   │   │   ├── users.js
│   │   │   ├── eventTypes.js
│   │   │   ├── availability.js
│   │   │   ├── bookings.js            # Public booking + reschedule
│   │   │   ├── meetings.js
│   │   │   └── ai.js                  # POST /api/ai/chat
│   │   ├── controllers/
│   │   │   ├── authController.js      # signup / login / logout / me
│   │   │   ├── userController.js
│   │   │   ├── eventTypeController.js
│   │   │   ├── availabilityController.js
│   │   │   ├── bookingController.js
│   │   │   ├── meetingController.js
│   │   │   └── aiController.js        # chat() handler
│   │   ├── services/
│   │   │   ├── mail/
│   │   │   │   ├── index.js           # send() / sendNow() public API
│   │   │   │   ├── transport.js       # Nodemailer transporter (Gmail)
│   │   │   │   ├── queue.js           # In-memory queue with retries
│   │   │   │   ├── templateEngine.js  # Handlebars compiler + cache
│   │   │   │   └── templates/
│   │   │   │       ├── layouts/base.hbs
│   │   │   │       ├── booking-confirmation.hbs
│   │   │   │       ├── booking-cancelled.hbs
│   │   │   │       └── meeting-reminder.hbs
│   │   │   ├── googleMeet.js          # Google Calendar API integration
│   │   │   └── ai/
│   │   │       ├── index.js           # Public runAgent() entry point
│   │   │       ├── agentLoop.js       # Multi-step Gemini agent loop
│   │   │       ├── gemini.js          # Gemini client + model factory
│   │   │       ├── prompts/
│   │   │       │   └── system.js      # System prompt builder (user-scoped)
│   │   │       └── tools/
│   │   │           ├── schemas.js     # Gemini function declarations
│   │   │           ├── index.js       # Tool dispatcher (runTool)
│   │   │           ├── getMeetings.js
│   │   │           ├── getEventTypes.js
│   │   │           ├── getAvailability.js
│   │   │           ├── sqlSandbox.js  # SELECT-only query executor
│   │   │           └── sendEmail.js   # Invitee email (ownership-verified)
│   │   ├── config/
│   │   │   └── mail.js                # Centralised mail config
│   │   ├── middleware/
│   │   │   ├── auth.js                # requireAuth — JWT cookie verification
│   │   │   └── errorHandler.js
│   │   └── app.js
│   ├── drizzle.config.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.js
    │   ├── (auth)/
    │   │   ├── layout.tsx             # Auth-only layout (no sidebar)
    │   │   ├── login/page.tsx         # Sign-in form
    │   │   └── signup/page.tsx        # Registration form
    │   ├── (dashboard)/
    │   │   ├── event-types/page.tsx   # Event types management
    │   │   ├── availability/page.tsx  # Weekly schedule editor
    │   │   └── meetings/page.tsx      # Upcoming / Past meetings
    │   └── [username]/[slug]/
    │       ├── page.tsx               # Public booking page
    │       └── confirmed/page.tsx     # Booking confirmation
    ├── components/
    │   ├── auth/
    │   │   └── AuthProvider.tsx       # React context: user, login, signup, logout
    │   ├── layout/                    # Sidebar + Header
    │   ├── event-types/               # EventTypeCard, EventTypeForm
    │   ├── booking/                   # CalendarPicker, TimeSlotList, BookingForm
    │   ├── meetings/                  # MeetingCard
    │   └── ui/                        # Toast, shared UI primitives
    ├── lib/
    │   └── api.ts                     # Typed fetch wrappers for all endpoints
    └── package.json
```

---

## 🗄 Database Schema

```
users
 ├── id, name, email, username, timezone
 │
 ├── eventTypes               (1 user → many event types)
 │    └── meetings             (1 event type → many meetings)
 │
 └── availabilitySchedules    (1 user → 1 default schedule)
      ├── availabilityRules       (0–7 day-of-week rules per schedule)
      └── availabilityOverrides   (date-specific exceptions)
```

### Key Tables

| Table | Key Columns |
|-------|------------|
| `users` | `id`, `username`, `timezone` |
| `event_types` | `userId`, `title`, `slug`, `duration`, `meetType`, `bufferBefore`, `bufferAfter`, `isActive` |
| `availability_schedules` | `userId`, `timezone`, `isDefault` |
| `availability_rules` | `scheduleId`, `dayOfWeek` (0=Sun…6=Sat), `startTime`, `endTime` |
| `availability_overrides` | `scheduleId`, `overrideDate`, `isUnavailable`, `startTime`, `endTime` |
| `meetings` | `eventTypeId`, `inviteeName`, `inviteeEmail`, `startTime`, `endTime`, `meetUrl`, `status`, `cancelReason` |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register new user; returns user object + sets `token` cookie |
| `POST` | `/api/auth/login` | ❌ | Authenticate with email + password; returns user + sets `token` cookie |
| `POST` | `/api/auth/logout` | ❌ | Clears the `token` cookie |
| `GET` | `/api/auth/me` | ✅ | Returns the authenticated user's profile |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/me` | Get current user profile |
| `PUT` | `/api/users/me` | Update name, timezone, username |

### Event Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/event-types` | List all event types |
| `POST` | `/api/event-types` | Create event type |
| `GET` | `/api/event-types/:id` | Get single event type |
| `PUT` | `/api/event-types/:id` | Update event type |
| `DELETE` | `/api/event-types/:id` | Delete event type |
| `PATCH` | `/api/event-types/:id/toggle` | Toggle active/inactive |

### Availability

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/availability` | Get default schedule + rules |
| `PUT` | `/api/availability/rules` | Replace all day rules (transactional) |
| `PUT` | `/api/availability/timezone` | Update schedule timezone |
| `GET` | `/api/availability/overrides` | List date overrides |
| `POST` | `/api/availability/overrides` | Upsert a date override |
| `DELETE` | `/api/availability/overrides/:id` | Remove an override |

### Public Booking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookings/:username` | Public event types for a user |
| `GET` | `/api/bookings/:username/:slug` | Event type details by slug |
| `GET` | `/api/bookings/:username/:slug/slots?date=YYYY-MM-DD` | Available time slots |
| `POST` | `/api/bookings/:username/:slug` | Create a booking |
| `GET` | `/api/bookings/reschedule/:meetingId` | Get meeting for rescheduling |
| `PATCH` | `/api/bookings/reschedule/:meetingId` | Reschedule to a new time |

### Meetings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meetings?status=upcoming\|past\|all` | List meetings |
| `GET` | `/api/meetings/:id` | Single meeting details |
| `PATCH` | `/api/meetings/:id/cancel` | Cancel a meeting |

---

## 📧 Email Notifications

The mailing system uses **Nodemailer** with Gmail SMTP and **Handlebars** for HTML templating, processed through a custom **in-memory async queue** with retry support.

```
Controller → mailService.send() → In-Memory Queue → Nodemailer Transport → Gmail SMTP
                                        ↓
                                Handlebars Templates (base layout + body partial)
```

### Email Events

| Trigger | Template | Recipients |
|---------|----------|------------|
| Meeting booked | `booking-confirmation` | Invitee |
| Meeting cancelled | `booking-cancelled` | Invitee |
| Meeting rescheduled | `booking-reschedule` | Invitee |
| Google Meet link generated | Inline update to confirmation | Host + Invitee |

### Queue Behaviour

- **Non-blocking** — `send()` returns immediately; email is processed in background
- **Auto-retry** — Up to 3 attempts with escalating delays: 2s → 5s → 15s
- **Startup verification** — `verifyTransport()` is called on server boot to confirm SMTP connectivity

---

## 🎥 Google Meet Integration

When a meeting is booked, a background job is enqueued to generate a Google Meet link via the **Google Calendar API**:

1. A **Service Account** is used (no user OAuth required)
2. A Google Calendar event is created with `conferenceDataVersion=1` to request a Meet link
3. The `hangoutLink` is extracted and saved to the `meetings.meetUrl` column
4. A follow-up email with the Meet link is sent to both host and invitee

> **Note:** The service account requires Calendar API access. For production, the service account should have domain-wide delegation or be granted access to the host's calendar.

---

## 🚀 Deployment

### Frontend → Vercel

1. Push your repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repository.
3. Set the **Root Directory** to `frontend`.
4. Add the environment variable:

   ```
   NEXT_PUBLIC_API_URL=https://calenderly-api.vipuldixit.tech/api
   ```

5. Click **Deploy**. Vercel auto-deploys on every push to `main`.

### Backend → AWS EC2 + Nginx

1. **Provision an EC2 instance** (Ubuntu 22.04 LTS recommended, `t2.micro` for free tier).
2. **SSH in** and install dependencies:

   ```bash
   sudo apt update && sudo apt install -y nodejs npm nginx
   ```

3. **Clone the repo and install:**

   ```bash
   git clone https://github.com/your-username/calenderly.git
   cd calenderly/backend
   npm install
   ```

4. **Create your `.env`** with all required environment variables.
5. **Run with PM2** (process manager to keep it alive):

   ```bash
   npm install -g pm2
   pm2 start src/app.js --name calenderly-api
   pm2 save && pm2 startup
   ```

6. **Configure Nginx** as a reverse proxy at `/etc/nginx/sites-available/calenderly-api`:

   ```nginx
   server {
       listen 80;
       server_name calenderly-api.vipuldixit.tech;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable and reload Nginx:**

   ```bash
   sudo ln -s /etc/nginx/sites-available/calenderly-api /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

8. **Enable HTTPS** with Certbot:

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d calenderly-api.vipuldixit.tech
   ```

### Database → Neon

1. Create a free account at [neon.tech](https://neon.tech).
2. Create a new project and database.
3. Copy the connection string — it looks like:

   ```
   postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

4. Set this as `DATABASE_URL` in your backend environment.

---

## 💻 Local Setup

### Prerequisites

- Node.js ≥ 18
- A [Neon](https://neon.tech) PostgreSQL database (free tier works fine)
- A Gmail account with an [App Password](https://myaccount.google.com/security) for email

### 1. Clone the repository

```bash
git clone https://github.com/your-username/calenderly.git
cd calenderly
```

### 2. Configure the Backend

```bash
cd backend
cp .env.example .env   # or create .env manually
```

Edit `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/dbname?sslmode=require"
FRONTEND_URL=http://localhost:3000

# Email (Gmail App Password)
MAIL_USER=your-email@gmail.com
MAIL_PASS=xxxx-xxxx-xxxx-xxxx
MAIL_FROM="Calenderly <your-email@gmail.com>"

# Google Meet (optional — skip if not needed)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Set Up the Database

```bash
cd backend

# Install dependencies
npm install

# Push schema to your Neon database (creates all tables)
npm run db:push

# Seed with a sample user + event types
npm run db:seed
```

> To view your database visually, run `npm run db:studio` and open <http://local.drizzle.studio>

### 4. Start the Backend

```bash
npm run dev
# → Server running on http://localhost:5000
# → ✅ Mail transport verified
```

### 5. Configure the Frontend

```bash
cd ../frontend
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Start the Frontend

```bash
npm install
npm run dev
# → Frontend running on http://localhost:3000
```

### 7. Try it out

| URL | What you'll see |
|-----|----------------|
| `http://localhost:3000/signup` | Create a new account |
| `http://localhost:3000/login` | Sign in to your account |
| `http://localhost:3000` | Dashboard — manage event types |
| `http://localhost:3000/availability` | Set your weekly hours |
| `http://localhost:3000/meetings` | View upcoming & past meetings |
| `http://localhost:3000/vipul05/quick-chat` | Public booking page (invitee view) |

> The seed user credentials are: email `vipul@example.com` / password `password123` (created by `npm run db:seed`)

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string |
| `FRONTEND_URL` | **Yes** | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `JWT_SECRET` | **Yes** | Secret key for signing JWTs (use a strong random string in production) |
| `JWT_EXPIRES_IN` | No | JWT expiry duration (default: `7d`) |
| `MAIL_USER` | Yes* | Gmail address used to send emails |
| `MAIL_PASS` | Yes* | Gmail App Password (16-char) |
| `MAIL_FROM` | No | Display name + address for outbound emails |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | No | Service account email for Google Meet |
| `GOOGLE_PRIVATE_KEY` | No | Private key for Google service account |

> *Required for email functionality; app still runs without them but emails will silently fail.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base URL |

---

## 📜 Available Scripts

### Backend

```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start for production
npm run db:push      # Push schema changes to DB (dev)
npm run db:generate  # Generate SQL migration files
npm run db:migrate   # Apply migration files (production)
npm run db:studio    # Open Drizzle Studio (visual DB browser)
npm run db:seed      # Seed database with sample data
```

### Frontend

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm start            # Start production server
```

---

## 🏗 Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **JWT + HTTP-only cookies** | Credential-based auth using `bcrypt` password hashing and JWTs stored in `HttpOnly` cookies; avoids `localStorage` XSS risks and any third-party auth dependency |
| **In-memory email queue** | Avoids Redis dependency; acceptable for free-tier with low volume |
| **Drizzle ORM** | Type-safe, lightweight, excellent Neon compatibility |
| **Neon Serverless Driver** | Required for Neon's HTTP connection model; regular `pg` pools won't work in serverless |
| **Handlebars for emails** | Separates HTML from code; easily extensible with new templates |
| **Async Google Meet generation** | Keeps booking response fast; Meet link is delivered via follow-up email |

---

<div align="center">
  <p>Built with ❤️</p>
</div>
