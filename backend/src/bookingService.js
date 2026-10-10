import { config } from './config.js';
import { startSession } from './db.js';
import { parseParentLocalTime } from './time.js';

const DURATION_ALLOWED = new Set([30]);

export async function createBooking(db, input) {
  const { parentName, parentEmail, parentTimeZone, startAt } = input;
  const durationMinutes = Number(input.durationMinutes || 30);
  if (typeof parentName !== 'string' || parentName.trim().length < 2 || parentName.length > 120) {
    const error = new Error('Please enter a parent name between 2 and 120 characters.');
    error.status = 400; throw error;
  }
  if (typeof parentEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail) || parentEmail.length > 190) {
    const error = new Error('Please enter a valid parent email address.');
    error.status = 400; throw error;
  }
  if (!DURATION_ALLOWED.has(durationMinutes)) {
    const error = new Error('Trial classes are 30 minutes long.');
    error.status = 400; throw error;
  }

  const parentStart = parseParentLocalTime(startAt, parentTimeZone);
  if (parentStart.toMillis() <= Date.now()) {
    const error = new Error('Please choose a future time slot.');
    error.status = 400; throw error;
  }
  const parentEnd = parentStart.plus({ minutes: durationMinutes });
  const startUtc = parentStart.toUTC();
  const endUtc = parentEnd.toUTC();
  const mentorsCollection = db.collection('mentors');
  const bookings = db.collection('bookings');
  const outbox = db.collection('email_outbox');

  // Atlas supports transactions. The transaction keeps assignment and the two outbox
  // records together so a booking is not partially saved.
  const session = startSession();

  let response;
  try {
    await session.withTransaction(async () => {
      response = await assignAndSave({ db, session, parentName, parentEmail, parentTimeZone, parentStart, parentEnd, startUtc, endUtc, durationMinutes });
    });
    return response;
  } finally {
    await session.endSession();
  }
}

async function assignAndSave({ db, session, parentName, parentEmail, parentTimeZone, parentStart, parentEnd, startUtc, endUtc, durationMinutes }) {
  const opts = session ? { session } : {};
  const mentors = await db.collection('mentors').find({ active: true }, opts).sort({ id: 1 }).toArray();
  let selected = null;
  for (const mentor of mentors) {
    // Write a tiny allocation counter inside the transaction to serialize competing
    // assignments for this mentor; concurrent transactions will retry on write conflict.
    await db.collection('mentors').updateOne(
      { id: mentor.id, active: true },
      { $inc: { allocationVersion: 1 } },
      opts
    );
    const mentorLocal = startUtc.setZone(mentor.timeZone);
    const dayStart = mentorLocal.startOf('day').toUTC().toJSDate();
    const dayEnd = mentorLocal.startOf('day').plus({ days: 1 }).toUTC().toJSDate();
    const dailyCount = await db.collection('bookings').countDocuments({
      mentorId: mentor.id, status: 'confirmed', startAtUtc: { $gte: dayStart, $lt: dayEnd }
    }, opts);
    if (dailyCount >= 2) continue;
    const overlaps = await db.collection('bookings').countDocuments({
      mentorId: mentor.id, status: 'confirmed',
      startAtUtc: { $lt: endUtc.toJSDate() }, endAtUtc: { $gt: startUtc.toJSDate() }
    }, opts);
    if (overlaps > 0) continue;
    selected = mentor;
    break;
  }
  if (!selected) {
    const error = new Error('Sorry, all mentors are booked or unavailable for this time. Please choose another time slot.');
    error.status = 409; error.code = 'NO_MENTOR_AVAILABLE'; throw error;
  }

  const classLink = `${config.classLinkBase}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const parentEmailClean = parentEmail.trim().toLowerCase();
  const parentNameClean = parentName.trim();
  const createdAt = new Date();
  const bookingDoc = {
    parentName: parentNameClean,
    parentEmail: parentEmailClean,
    parentTimeZone,
    mentorId: selected.id,
    mentorName: selected.name,
    mentorEmail: selected.email,
    mentorTimeZone: selected.timeZone,
    startAtUtc: startUtc.toJSDate(),
    endAtUtc: endUtc.toJSDate(),
    durationMinutes,
    classLink,
    status: 'confirmed',
    createdAt
  };
  const insert = await db.collection('bookings').insertOne(bookingDoc, session ? { session } : {});
  const id = insert.insertedId.toString();
  const parentTime = parentStart.toFormat("ccc, dd LLL yyyy 'at' hh:mm a ZZZZ");
  const mentorTime = startUtc.setZone(selected.timeZone).toFormat("ccc, dd LLL yyyy 'at' hh:mm a ZZZZ");
  const subject = 'Your Codeyoung trial class is confirmed';
  await db.collection('email_outbox').insertMany([
    { bookingId: id, recipientEmail: parentEmailClean, recipientRole: 'parent', subject,
      body: `Hi ${parentNameClean},\n\nYour trial class is confirmed.\nYour local time: ${parentTime} (${parentTimeZone})\nMentor: ${selected.name}\nClass link: ${classLink}\n\nPlease keep this link for your demo class.`,
      status: 'pending', attempts: 0, lastError: null, createdAt, sentAt: null },
    { bookingId: id, recipientEmail: selected.email, recipientRole: 'mentor', subject,
      body: `Hi ${selected.name},\n\nA trial class has been assigned to you.\nMentor local time: ${mentorTime} (${selected.timeZone})\nParent: ${parentNameClean} (${parentEmailClean})\nClass link: ${classLink}`,
      status: 'pending', attempts: 0, lastError: null, createdAt, sentAt: null }
  ], session ? { session } : {});

  return {
    id,
    parentName: parentNameClean,
    parentEmail: parentEmailClean,
    parentTimeZone,
    parentLocalStart: parentStart.toISO(),
    parentLocalEnd: parentEnd.toISO(),
    mentor: { id: selected.id, name: selected.name, email: selected.email, timeZone: selected.timeZone },
    mentorLocalStart: startUtc.setZone(selected.timeZone).toISO(),
    startAtUtc: startUtc.toISO(),
    endAtUtc: endUtc.toISO(),
    durationMinutes,
    classLink,
    status: 'confirmed'
  };
}
