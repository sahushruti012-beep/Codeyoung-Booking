import nodemailer from 'nodemailer';
import { config } from './config.js';

let transporter;
function getTransporter() {
  if (config.emailMode !== 'smtp') return null;
  if (!config.smtp.host || !config.smtp.user || !config.smtp.password) {
    throw new Error('EMAIL_MODE=smtp requires SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.');
  }
  transporter ||= nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.password }
  });
  return transporter;
}

export async function deliverOutboxBatch(db, limit = 20) {
  const rows = await db.collection('email_outbox')
    .find({ status: 'pending' }).sort({ id: 1, createdAt: 1 }).limit(limit).toArray();
  for (const row of rows) {
    try {
      const transport = getTransporter();
      if (transport) {
        await transport.sendMail({
          from: config.smtp.from,
          to: row.recipientEmail,
          subject: row.subject,
          text: row.body
        });
      } else {
        console.log(`\n[EMAIL OUTBOX - DEV MODE]\nTo: ${row.recipientEmail}\nSubject: ${row.subject}\n${row.body}\n`);
      }
      await db.collection('email_outbox').updateOne(
        { _id: row._id, status: 'pending' },
        { $set: { status: 'sent', sentAt: new Date(), lastError: null }, $inc: { attempts: 1 } }
      );
    } catch (err) {
      await db.collection('email_outbox').updateOne(
        { _id: row._id, status: 'pending' },
        { $set: { status: 'failed', lastError: String(err.message || err) }, $inc: { attempts: 1 } }
      );
      console.error('Email delivery failed:', err.message);
    }
  }
}
