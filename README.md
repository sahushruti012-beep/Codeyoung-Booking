# Codeyoung Trial Class Booking System

A full-stack appointment booking demo built with React, Node.js, Express, MongoDB, Luxon, and Nodemailer.

## Features

- Parent booking form with local time-zone selection using IANA time zones.
- Ten seeded mentors, with at most two bookings per mentor per local calendar day.
- Automatic mentor assignment and schedule-overlap checks.
- Daylight-saving-aware time conversion using Luxon.
- Mentor and admin dashboards.
- Demo live-class links for bookings.
- Email outbox records and optional SMTP via Nodemailer.
- MongoDB collections initialized automatically on backend startup.

## Requirements

- Node.js and npm
- MongoDB replica set or MongoDB Atlas
- VS Code (recommended)

## 1. Configure and run the backend

Open PowerShell in the project folder:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env` and configure your MongoDB connection string and database name:

```dotenv
MONGODB_DATABASE=codeyoung_booking
```

Set `MONGODB_URI` to your own MongoDB connection string. Keep actual credentials in `.env`, never in GitHub.

Then run:

```powershell
npm install
npm run dev
```

The API runs at `http://localhost:4000`.

Verify the API at `http://localhost:4000/api/health`.

## 2. Configure and run the frontend

Open a second PowerShell terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## 3. Demo workflow

1. Open the parent booking page.
2. Enter parent details, select a future date and time, and choose the parent's time zone.
3. Submit the booking.
4. View bookings in the Mentor Dashboard or Admin Dashboard.
5. Configure SMTP if you want booking emails to be sent.

## SMTP configuration

Set the following variables in `backend/.env`:

```dotenv
EMAIL_MODE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address
SMTP_PASSWORD=your-google-app-password
SMTP_FROM="Codeyoung Trials <your-gmail-address>"
```

Replace the example values with your own settings. Never commit real SMTP credentials or app passwords.

## API endpoints

- `GET /api/health`
- `GET /api/mentors`
- `GET /api/slots?date=YYYY-MM-DD&timeZone=America/New_York`
- `POST /api/bookings`
- `GET /api/bookings?role=admin`
- `GET /api/bookings?role=mentor&mentorId=1`

## Booking payload example

```json
{
  "parentName": "Alex Parent",
  "parentEmail": "alex@example.com",
  "parentTimeZone": "America/New_York",
  "startAt": "2026-10-15T16:00",
  "durationMinutes": 30
}
```

`startAt` is a local wall-clock date and time in `parentTimeZone`. The backend converts it to UTC and checks the mentor's local daily limit.

## Important notes

- Booking instants are stored in UTC.
- Daylight-saving transitions can create nonexistent or ambiguous local times.
- Mentor daily limits are counted in the mentor's configured time zone.
- MongoDB transactions require MongoDB Atlas or a replica set.
- This is a demo project. The dashboards do not provide production-grade authentication or authorization.
- The class links are demo links, not automatically generated Google Meet meetings.

## Tests

```powershell
cd backend
npm test
```

## GitHub submission checklist

- Do not commit `.env` files or credentials.
- Commit `.env.example`, source code, README, and relevant documentation.
- The `database/setup.sql` file is retained for reference; the current backend uses MongoDB.
