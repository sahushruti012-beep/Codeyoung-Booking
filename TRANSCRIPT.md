# AI Session Transcript

> This file is a concise record of the AI-assisted planning and implementation process for this repository. It is not an exported verbatim transcript of an external AI product session. If the evaluator requires a verbatim transcript, export the original session from the tool used and replace/append that export here.

## User prompt — project brief

Build a trial-class appointment booking system for Codeyoung. Parents choose a comfortable time slot; an available mentor is assigned; parent and mentor receive a demo-class link. Use React for the frontend and Node.js or Python for backend APIs. There are 10 mentors and up to 20 interested parents per day. Handle parent/mentor time zones, daylight saving time, a maximum of 2 demo classes per mentor per day, and an appropriate no-availability error state. Submission requires a GitHub repository, README, and transcript.

## User prompt — architecture blueprint

The supplied system architecture shows Parent React UI, Mentor Dashboard, and Admin Dashboard calling an Express REST API, followed by input validation and a booking service. The booking service uses a time-zone service, MongoDB in the drawing, and an email outbox/worker/SMTP provider. The implementation adapts the persistence layer to the user's existing MySQL 8.0.46 installation.

## User prompt — local environment

The user confirmed MySQL Server 8.0.46 in MySQL Workbench and Node.js v24.21.0 with npm 11.19.0 on Windows.

## Assistant design decisions

- Use React + Vite for the frontend and Node.js + Express for REST APIs.
- Use MySQL 8 with `mysql2/promise` and SQL setup/seed scripts.
- Use Luxon and IANA time-zone IDs for DST-aware date/time conversion.
- Store instants in UTC and retain the parent's and mentor's time-zone identifiers.
- Assign mentors transactionally, lock mentor rows, and enforce a maximum of two bookings per mentor-local day.
- Use an email outbox and a development worker that logs emails; allow SMTP configuration without requiring it for a local demo.
- Include a parent booking page and basic mentor/admin dashboards.
- Document the security and production-hardening work that is outside this take-home demo's scope.

## Implementation summary

The repository contains frontend and backend source, a MySQL setup script, `.env.example` files, API endpoints, a basic test, run instructions, and this transcript summary.
