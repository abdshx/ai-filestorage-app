import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const aiProcessQueue = new Queue('aiProcessQueue', { 
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times
    backoff: { 
      type: 'exponential', // Use exponential backoff
      delay: 10000 // Start with a 10-second delay (adjust as needed, 15s suggested by error)
    }
  }
});
