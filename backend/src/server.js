import express from 'express';
import cors from 'cors';
import { DateTime } from 'luxon';
import { config } from './config.js';
import { database, connectDatabase, checkDatabase } from './db.js';
import { createBooking } from './bookingService.js';
import { deliverOutboxBatch } from './email.js';
import { validTimeZone } from './time.js';

const app = express();
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabase();
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

app.get('/api/mentors', async (_req, res, next) => {
  try {
    const rows = await database.collection('mentors').find({ active: true })
      .project({ _id: 0, id: 1, name: 1, timeZone: 1 }).sort({ name: 1 }).toArray();
    res.json(rows.map(m => ({ ...m, timeZone: m.timeZone, time_zone: m.timeZone })));
  } catch (err) { next(err); }
});

app.get('/api/slots', async (req, res) => {
  const zone = String(req.query.timeZone || 'America/New_York');
  const date = String(req.query.date || '');
  if (!validTimeZone(zone)) return res.status(400).json({ error: 'Invalid IANA time zone.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Provide date=YYYY-MM-DD.' });
  const day = DateTime.fromISO(date, { zone });
  if (!day.isValid || day.toFormat('yyyy-LL-dd') !== date) return res.status(400).json({ error: 'Invalid date.' });
  const slots = [];
  for (let hour = 9; hour < 19; hour++) {
    for (const minute of [0, 30]) {
      const slot = DateTime.fromObject({ year: day.year, month: day.month, day: day.day, hour, minute }, { zone });
      if (!slot.isValid || slot.toFormat("yyyy-MM-dd'T'HH:mm") !== `${date}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`) continue;
      if (slot.toMillis() > Date.now()) slots.push({
        value: slot.toFormat("yyyy-MM-dd'T'HH:mm"),
        label: slot.toFormat('hh:mm a ZZZZ'),
        timeZone: zone
      });
    }
  }
  res.json({ date, timeZone: zone, slots });
});

app.post('/api/bookings', async (req, res, next) => {
  try {
    const booking = await createBooking(database, req.body || {});
    res.status(201).json({ message: 'Trial class booked successfully.', booking });
    setImmediate(() => deliverOutboxBatch(database).catch(err => console.error('Outbox worker error:', err)));
  } catch (err) { next(err); }
});

app.get('/api/bookings', async (req, res, next) => {
  try {
    const role = String(req.query.role || 'admin');
    const filter = { status: 'confirmed' };
    if (role === 'mentor') {
      const mentorId = Number(req.query.mentorId);
      if (!Number.isInteger(mentorId) || mentorId < 1) return res.status(400).json({ error: 'A valid mentorId is required for mentor view.' });
      filter.mentorId = mentorId;
    } else if (role !== 'admin') {
      return res.status(400).json({ error: 'role must be admin or mentor.' });
    }
    const rows = await database.collection('bookings').find(filter).sort({ startAtUtc: -1 }).limit(500).toArray();
    res.json(rows.map(b => ({
      id: b._id.toString(),
      parentName: b.parentName,
      parentEmail: b.parentEmail,
      parentTimeZone: b.parentTimeZone,
      mentorId: b.mentorId,
      mentorName: b.mentorName,
      mentorTimeZone: b.mentorTimeZone,
      startAtUtc: b.startAtUtc,
      endAtUtc: b.endAtUtc,
      durationMinutes: b.durationMinutes,
      classLink: b.classLink,
      createdAt: b.createdAt
    })));
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.status ? err.message : 'Unexpected server error.',
    ...(err.code ? { code: err.code } : {})
  });
});

async function start() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`Codeyoung Booking API listening at http://localhost:${config.port}`);
    console.log('MongoDB connected; 10 mentor records are ready.');
  });
}

if (process.env.NODE_ENV !== 'test') {
  start().catch(err => {
    console.error('Could not start the API:', err.message);
    process.exit(1);
  });
}
export default app;
