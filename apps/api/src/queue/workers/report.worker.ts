import { Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

export const reportWorker = new Worker(
  'report',
  async (job) => {
    console.log(`Processing report job ${job.id}:`, job.data);

    const { type, id, tenantId } = job.data;

    // Simulate report generation
    // In production, this would call PdfReportsService
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Report generated: ${type} for ${id} in tenant ${tenantId}`);
    return { generated: true, type, id };
  },
  { connection },
);

reportWorker.on('completed', (job) => {
  console.log(`Report job ${job.id} completed`);
});

reportWorker.on('failed', (job, err) => {
  console.error(`Report job ${job?.id} failed:`, err.message);
});

console.log('Report worker started');
