# Codeyoung Trial Class Booking System

A full-stack appointment booking demo built with React, Node.js, Express, MongoDB, Luxon, and Nodemailer.

## Features

- Parent booking form with local time-zone selection (IANA zones such as `America/New_York`, `Europe/London`, `Asia/Kolkata`).
- Ten seeded mentors; at most two bookings per mentor per local calendar day in that mentor's configured time zone.
- Automatic mentor assignment and overlap checks. MongoDB transactions are used; use MongoDB Atlas or a MongoDB replica set.
- Daylight-saving-aware time conversion using Luxon and IANA time-zone identifiers.
- Mentor and admin dashboards.
- Dummy live-class link on each booking.
- Email outbox records and development-mode email worker that logs messages; optional SMTP via Nodemailer.
- MongoDB collections are initialized automatically on backend startup.

## Requirements

- Node.js 24.x and npm 11.x
- A MongoDB Atlas account (recommended; no local MongoDB installation required)
- VS Code (recommended)

## 1. Set up MongoDB Atlas

1. Create a free account at https://www.mongodb.com/cloud/atlas/register.
2. Create a free cluster.
3. In **Database Access**, create a database user and password.
4. In **Network Access**, add your current IP address.
5. Select **Connect → Drivers → Node.js** and copy the connection string.
6. Keep your username/password private. If the password includes characters such as `#`, `@`, `/`, `:` or `%`, URL-encode them in the URI.

## 2. Configure and run the backend

Open PowerShell in the project folder:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env`. Replace `MONGODB_URI` with the connection string copied from Atlas and set `MONGODB_DATABASE=codeyoung_booking`. Keep `EMAIL_MODE=console` initially so you can test bookings without SMTP setup. The backend creates the required collections/indexes and inserts the ten demo mentors automatically.

Then run:

```powershell
npm install
npm run dev
```

The API runs at `http://localhost:4000`. Verify it at `http://localhost:4000/api/health`; the response should include `"database":"connected"`.

## 3. Configure and run the frontend

Open a **second** PowerShell terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

## 4. Demo workflow

1. Open the parent booking page.
2. Enter parent details, choose a future date/time, and select the parent's time zone.
3. Submit the booking. The API assigns an eligible mentor, saves the booking and two email-outbox records, and returns a dummy class link.
4. Open the Mentor Dashboard or Admin Dashboard to inspect bookings.
5. With `EMAIL_MODE=console`, parent/mentor email messages are printed in the backend terminal. SMTP is optional.

## SMTP (optional)

Set `EMAIL_MODE=smtp` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `backend/.env`. For Gmail, use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, your full Gmail address, and a Google App Password (not your normal Gmail password).

## API endpoints

- `GET /api/health`
- `GET /api/mentors`
- `GET /api/slots?date=YYYY-MM-DD&timeZone=America/New_York`
- `POST /api/bookings`
- `GET /api/bookings?role=admin`
- `GET /api/bookings?role=mentor&mentorId=1`

## Booking payload

```json
{
  "parentName": "Alex Parent",
  "parentEmail": "alex@example.com",
  "parentTimeZone": "America/New_York",
  "startAt": "2026-10-15T16:00",
  "durationMinutes": 30
}
```

`startAt` is a wall-clock date/time in `parentTimeZone`, with no offset. The backend converts it to UTC and independently checks the mentor's local daily limit. The demo UI sends the chosen parent-local time.

## Important notes

- Booking instants are stored as BSON dates in UTC; time-zone identifiers are stored separately.
- DST transitions can create nonexistent or ambiguous local wall-clock times. The backend rejects those times.
- The daily limit is counted in each mentor's configured time zone. Demo mentors default to `Asia/Kolkata`.
- Atlas transactions protect the booking assignment and email outbox writes. Use Atlas (or a MongoDB replica set), because standalone local MongoDB does not support multi-document transactions.
- This is a take-home demo, not a production identity/security system. Dashboards are demonstration views without authentication. Add authentication/authorization, rate limiting, audit logs, and robust email retries before production.

## Tests

```powershell
cd backend
npm test
```

## GitHub submission checklist

- Do not commit `backend/.env` or secrets.
- Commit `.env.example`, source code, README, and `TRANSCRIPT.md`.
- The old `database/setup.sql` is retained for reference only; the MongoDB backend does not use it.
