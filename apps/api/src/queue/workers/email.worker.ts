import { Worker } from 'bullmq';
import * as nodemailer from 'nodemailer';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

export const emailWorker = new Worker(
  'email',
  async (job) => {
    console.log(`Processing email job ${job.id}:`, job.data);

    if (!process.env.EMAIL_SMTP_HOST) {
      console.log('SMTP not configured, skipping email send');
      return { skipped: true };
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@hms-saas.com',
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
      });

      console.log(`Email sent successfully to ${job.data.to}`);
      return { sent: true, to: job.data.to };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  },
  { connection },
);

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message);
});

console.log('Email worker started');
