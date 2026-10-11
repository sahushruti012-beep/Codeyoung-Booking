
# Codeyoung Trial Class Booking System

A full-stack web application for managing trial-class bookings, mentor allocation, time-zone-aware scheduling, and email notifications. Built using React, Node.js, Express, MongoDB, Luxon, and Nodemailer.

## 1. Project Overview

The Codeyoung Trial Class Booking System streamlines the trial-class scheduling process by allowing parents to book classes, checking mentor availability, and assigning mentors automatically.

The application supports time-zone-aware scheduling, mentor booking limits, mentor and admin dashboards, and optional email notifications.

## 2. Key Features

- Parent booking form with IANA time-zone selection.
- Ten mentor records initialized automatically by the backend.
- Maximum of two bookings per mentor per local calendar day.
- Automatic mentor assignment and schedule-overlap validation.
- Time-zone conversion and daylight-saving-time handling using Luxon.
- Mentor and admin booking dashboards.
- Demo class links associated with bookings.
- Email outbox records and optional SMTP notifications using Nodemailer.
- Automatic MongoDB collection and index initialization.
- REST API endpoints for mentors, available slots, and bookings.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Active database | MongoDB |
| Date and time handling | Luxon |
| Email notifications | Nodemailer |
| Testing | Node.js test runner |
| Version control | Git and GitHub |

## 4. Database Architecture

**MongoDB is the active database used by the current application. MySQL is not required to run this project.**

The Node.js backend connects to MongoDB to store and manage application data. It initializes the required collections and indexes and ensures that the mentor records are available.

The repository also contains `database/setup.sql`, which defines a MySQL schema retained as a reference from the SQL-based database design.

The two database references serve different purposes:

- **MongoDB:** The active database used by the current backend for booking operations.
- **MySQL (`database/setup.sql`):** A reference SQL schema that the current backend does not execute or use.

Only MongoDB needs to be configured to run the current application. The SQL file is not part of the active database workflow.

## 5. System Requirements

Before starting the application, install:

- Node.js and npm.
- MongoDB configured as a replica set, or a MongoDB Atlas deployment.
- VS Code or another code editor (recommended).
- Git, if you want to clone the repository.

**Important:** The booking implementation uses MongoDB transactions. The database must support transactions through a replica set or a compatible sharded cluster.

## 6. Installation and Setup

### Step 1: Clone the Repository

Open PowerShell and run:

```powershell
git clone https://github.com/sahushruti012-beep/Codeyoung-Booking.git
cd Codeyoung-Booking
```

If you have already downloaded the project, open PowerShell in the existing project folder instead.

### Step 2: Configure the Backend

Move into the backend directory:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Open `backend/.env` and configure the MongoDB connection:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=rs0
MONGODB_DATABASE=codeyoung_booking
```

The URI above is an example for a local MongoDB replica set named `rs0`. If you use MongoDB Atlas, replace it with your own connection string.

Keep actual credentials in your local `.env` file. Never upload database credentials or passwords to GitHub.

### Step 3: Start the Backend

From the `backend` directory, run:

```powershell
npm run dev
```

The API should be available at:

`http://localhost:4000`

To verify the API, open:

`http://localhost:4000/api/health`

Keep the backend terminal open while using the application.

### Step 4: Configure the Frontend

Open a second PowerShell terminal in the project root directory:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
```

If you are already inside the project root, these commands will work as shown. Otherwise, navigate to the project root before running them.

### Step 5: Start the Frontend

From the `frontend` directory, run:

```powershell
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

Keep both the backend and frontend running while testing the complete application.

## 7. Booking Workflow

### Step 1: Enter Parent Details

Open the parent booking page and provide the required parent information and email address.

### Step 2: Select a Date and Time

Choose a future date, an available time slot, and the parent's time zone.

### Step 3: Validate Availability

The backend checks mentor availability, schedule overlaps, and the configured mentor daily booking limit.

### Step 4: Assign a Mentor

The backend selects an eligible mentor according to the implemented assignment and scheduling rules.

### Step 5: Save the Booking

The booking is stored in MongoDB, with booking instants represented in UTC.

### Step 6: Review the Booking

Use the Mentor Dashboard or Admin Dashboard to review booking information.

### Step 7: Send Email Notifications

Configure SMTP if you want the application to send real booking emails.

## 8. Email Configuration

The application uses Nodemailer to support email notifications. Gmail SMTP is one available configuration option.

### Step 1: Create a Google App Password

Enable two-step verification on your Google account and create an App Password if your account is eligible.

### Step 2: Configure SMTP

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

Replace the example values with your own credentials.

### Step 3: Restart the Backend

Save the environment file and restart the backend so the updated configuration takes effect.

**Security note:** Never commit real email passwords, Google App Passwords, or database credentials to GitHub.

## 9. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API health |
| GET | `/api/mentors` | Retrieve mentor information |
| GET | `/api/slots?date=YYYY-MM-DD&timeZone=America/New_York` | Retrieve available time slots |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?role=admin` | Retrieve bookings for the admin dashboard |
| GET | `/api/bookings?role=mentor&mentorId=1` | Retrieve bookings for a mentor |

## 10. Example Booking Request

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

`startAt` represents the parent's local wall-clock date and time in the specified `parentTimeZone`. The backend converts the time to UTC and applies the scheduling rules.

Use a valid future date and an available time when testing.

## 11. Running Tests

### Step 1: Open the Backend Directory

From the project root, run:

```powershell
cd backend
```

### Step 2: Execute the Tests

Run:

```powershell
npm test
```

Review the test output to determine whether the tests pass.

## 12. Limitations

- Sample mentor records are intended for demonstration purposes.
- The default trial-class duration is 30 minutes.
- Mentor selection follows a first-eligible assignment strategy.
- Booking cancellation and rescheduling are not currently exposed through API endpoints.
- Automatic email retries require a background worker or message queue.
- Class links are demo links; automatic Google Meet meeting creation is not implemented.
- The dashboards do not provide production-grade authentication or authorization.
- The application requires a MongoDB deployment that supports transactions.

## 13. Future Development

- Replace sample mentor records with a configurable mentor management system.
- Support configurable trial-class durations and scheduling rules.
- Improve mentor assignment using workload balancing and availability optimization.
- Add booking cancellation and rescheduling API endpoints.
- Implement automatic email retries using a background worker or message queue.
- Integrate Google Meet and Google Calendar APIs for automated meeting creation.
- Implement secure authentication and role-based access control for parents, mentors, and administrators.
- Add automated reminders and booking status notifications.
- Expand automated tests for scheduling conflicts, time-zone conversions, and daylight-saving transitions.
- Prepare the application for production with monitoring, logging, rate limiting, and database backup procedures.

## 14. Security and Configuration

- Keep `.env` files out of Git.
- Commit `.env.example` files containing placeholder values only.
- Never publish SMTP passwords, Google App Passwords, or database credentials.
- Implement secure authentication and authorization before exposing the application to real users.
- Use secure environment configuration for production deployments.

## 15. Project Structure

```text
Codeyoung-Booking/
├── backend/
│   ├── src/
│   │   ├── db.js
│   │   ├── bookingService.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── .env.example
│   └── package.json
├── database/
│   └── setup.sql
└── README.md
```

This is a simplified overview of the main project files. Additional files may exist in the repository.

## 16. Author

**Shruti Sahu**

## GitHub Profile

https://github.com/sahushruti012-beep

## Project Repository

https://github.com/sahushruti012-beep/Codeyoung-Booking.git

