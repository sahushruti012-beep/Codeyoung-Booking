import { MongoClient } from 'mongodb';
import { config } from './config.js';

const mentorSeeds = [
  ['Aarav Sharma', 'aarav.mentor@example.com'],
  ['Diya Patel', 'diya.mentor@example.com'],
  ['Ishaan Gupta', 'ishaan.mentor@example.com'],
  ['Ananya Singh', 'ananya.mentor@example.com'],
  ['Rohan Verma', 'rohan.mentor@example.com'],
  ['Meera Iyer', 'meera.mentor@example.com'],
  ['Kabir Das', 'kabir.mentor@example.com'],
  ['Sara Khan', 'sara.mentor@example.com'],
  ['Vivaan Rao', 'vivaan.mentor@example.com'],
  ['Aditi Joshi', 'aditi.mentor@example.com']
];

let client;
export let database;

export async function connectDatabase() {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to backend/.env.');
  }
  client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  database = client.db(config.mongoDatabase);

  await Promise.all([
    database.collection('mentors').createIndex({ email: 1 }, { unique: true }),
    database.collection('bookings').createIndex({ mentorId: 1, startAtUtc: 1 }),
    database.collection('bookings').createIndex({ parentEmail: 1 }),
    database.collection('email_outbox').createIndex({ status: 1, createdAt: 1 })
  ]);

  const mentors = database.collection('mentors');
  for (let i = 0; i < mentorSeeds.length; i++) {
    const [name, email] = mentorSeeds[i];
    await mentors.updateOne(
      { id: i + 1 },
      { $setOnInsert: { id: i + 1, name, email, timeZone: config.defaultMentorTimeZone, active: true, createdAt: new Date() } },
      { upsert: true }
    );
  }
  return database;
}

export function startSession() {
  if (!client) throw new Error('MongoDB is not connected.');
  return client.startSession();
}

export async function checkDatabase() {
  if (!database) throw new Error('MongoDB has not connected yet.');
  await database.command({ ping: 1 });
  return true;
}

export async function closeDatabase() {
  if (client) await client.close();
}
