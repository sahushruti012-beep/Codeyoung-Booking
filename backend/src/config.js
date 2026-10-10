import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  mongoDatabase: process.env.MONGODB_DATABASE || 'codeyoung_booking',
  defaultMentorTimeZone: process.env.DEFAULT_MENTOR_TIME_ZONE || 'Asia/Kolkata',
  classLinkBase: process.env.CLASS_LINK_BASE || 'https://demo-class.example.com/join',
  emailMode: process.env.EMAIL_MODE || 'console',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'Codeyoung Trials <trials@example.com>'
  }
};
