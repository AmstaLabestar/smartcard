const { z } = require('zod');
const dotenv = require('dotenv');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JSON_BODY_LIMIT: z.string().default('1mb'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),
  MAX_TRANSACTION_AMOUNT: z.coerce.number().positive().default(1000000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const fieldErrors = parsedEnv.error.flatten().fieldErrors;
  const missingOrInvalidKeys = Object.keys(fieldErrors);

  console.error('\nEnvironment configuration error');
  console.error('Missing or invalid variables:', missingOrInvalidKeys.join(', '));
  console.error('Details:', fieldErrors);
  console.error('Check your .env file or copy values from .env.example.\n');

  throw new Error(`Environment validation failed: ${missingOrInvalidKeys.join(', ')}`);
}

const env = parsedEnv.data;

module.exports = { env };
