# Codeyoung Trial Class Booking System

A full-stack trial class booking application developed using React, Node.js, Express, MongoDB, Luxon, and Nodemailer. The system enables parents to book trial classes, automatically assigns available mentors, handles time-zone differences, and supports email notifications.

## Features

- Parent booking form with IANA time-zone selection.
- Ten mentor records initialized automatically by the backend.
- Maximum of two bookings per mentor per local calendar day.
- Automatic mentor assignment and schedule-overlap validation.
- Time-zone conversion and daylight-saving-time handling using Luxon.
- Mentor and admin booking dashboards.
- Demo class links associated with bookings.
- Email outbox records and optional SMTP notifications using Nodemailer.
- Automatic MongoDB collection and index initialization.
- REST API for mentors, available slots, and bookings.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Active database | MongoDB |
| Date and time handling | Luxon |
| Email notifications | Nodemailer |
| Testing | Node.js test runner |

## Database Architecture

**This application currently uses MongoDB as its only active database. MySQL is not required to run the application.**

MongoDB was selected for the current backend because it works with the implemented Node.js application and stores application data as documents. The backend connects to MongoDB, initializes the required collections and indexes, and ensures that the mentor records are available.

The project also contains `database/setup.sql`, which defines a MySQL database schema. This file is retained as a reference from the SQL-based database design. The current backend does not execute this file or connect to MySQL.

Therefore, the two database references serve different purposes:

- **MongoDB:** The active database used by the current application for its booking operations.
- **MySQL (`database/setup.sql`):** A reference schema only; it is not part of the current runtime configuration.

There is no need to configure both databases. To run the submitted application, configure MongoDB as described below.

## Requirements

- Node.js and npm
- MongoDB configured as a replica set, or a MongoDB Atlas deployment
- VS Code or another code editor (recommended)

MongoDB transactions require replica-set support or a compatible sharded cluster.

## Backend Setup

Open PowerShell in the project root directory and run:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Open `backend/.env` and configure the MongoDB settings:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=rs0
MONGODB_DATABASE=codeyoung_booking
```

The URI shown above is an example for a local MongoDB replica set named `rs0`. If you use MongoDB Atlas, replace it with your own connection string.

Configure the remaining environment variables as needed. Keep database credentials and email passwords in the local `.env` file; never commit real credentials to GitHub.

Start the backend:

```powershell
npm run dev
```

The API runs at `http://localhost:4000`.

To check the API, open `http://localhost:4000/api/health` in your browser.

## Frontend Setup

Open a second PowerShell terminal in the project root:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

Keep the backend running while using the frontend.

## Booking Workflow

1. Open the parent booking page.
2. Enter the parent's details and email address.
3. Select a future date, an available time, and the parent's time zone.
4. Submit the booking.
5. Confirm that the booking is saved and a mentor is assigned.
6. Review bookings in the Mentor Dashboard or Admin Dashboard.
7. Configure SMTP if email notifications need to be tested.

The backend checks mentor availability, schedule overlaps, and the configured mentor daily booking limit.

## Email Configuration

The application uses Nodemailer for email notifications. Gmail SMTP can be configured using a Google App Password.

Add the following settings to `backend/.env`:

```dotenv
EMAIL_MODE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address
SMTP_PASSWORD=your-google-app-password
SMTP_FROM="Codeyoung Trials <your-gmail-address>"
```

Replace the example values with your own credentials. Restart the backend after changing environment variables.

Never publish real SMTP credentials, Google App Passwords, or database credentials.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API health |
| GET | `/api/mentors` | Retrieve mentors |
| GET | `/api/slots?date=YYYY-MM-DD&timeZone=America/New_York` | Retrieve available time slots |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?role=admin` | Retrieve bookings for the admin dashboard |
| GET | `/api/bookings?role=mentor&mentorId=1` | Retrieve bookings for a mentor |

## Example Booking Request

The following JSON illustrates a request to `POST /api/bookings`:

```json
{
  "parentName": "Alex Parent",
  "parentEmail": "alex@example.com",
  "parentTimeZone": "America/New_York",
  "startAt": "2026-10-15T16:00",
  "durationMinutes": 30
}
```

The `startAt` value represents the parent's local date and time in the specified `parentTimeZone`. The backend converts the time to UTC for storage and applies the booking rules.

Use a valid future date and an available time when testing.

## Testing

Run the backend tests from the project root:

```powershell
cd backend
npm test
```

Review the test output to determine whether the tests pass.

## Important Notes and Limitations

- Booking instants are stored in UTC.
- IANA time-zone identifiers are used for time-zone conversion.
- Daylight-saving transitions can produce nonexistent or ambiguous local times.
- Mentor daily booking limits are counted using each mentor's configured time zone.
- MongoDB must support transactions for the implemented transaction-based booking operations.
- Class links are demo links; the application does not automatically create Google Meet meetings.
- The dashboards do not provide production-grade authentication or authorization.
- Real email delivery requires valid SMTP configuration.

## Project Documentation

The repository contains the application source code, environment-variable templates, and project documentation. The `database/setup.sql` file is included for reference and is not required for application setup.

Keep local `.env` files and all real credentials out of the Git repository. Include the required project documentation and AI conversation transcript if requested by the manager.

## Author

**Shruti Sahu**

## GitHub Profile

https://github.com/sahushruti012-beep

## Project Repository

https://github.com/sahushruti012-beep/Codeyoung-Booking.git