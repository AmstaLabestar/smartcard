const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
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
