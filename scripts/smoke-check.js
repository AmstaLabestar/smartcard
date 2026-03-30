const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');

const requiredFiles = [
  '.env.example',
  'prisma/schema.prisma',
  'src/app.js',
  'src/server.js',
  'src/routes/index.js',
  'src/config/env.js',
  'src/config/prisma.js',
  'src/middlewares/error.middleware.js',
  'src/middlewares/auth.middleware.js',
  'src/modules/auth/auth.routes.js',
  'src/modules/card/card.routes.js',
  'src/modules/offer/offer.routes.js',
  'src/modules/transaction/transaction.routes.js',
  'src/modules/me/me.routes.js',
];

function assertFilesExist() {
  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(projectRoot, file)));

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files:\n- ${missingFiles.join('\n- ')}`);
  }
}

function collectJavaScriptFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectJavaScriptFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkSyntax(files) {
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');

    try {
      new vm.Script(source, { filename: file });
    } catch (error) {
      const relativePath = path.relative(projectRoot, file);
      throw new Error(`Syntax check failed for ${relativePath}\n${error.message}`);
    }
  }
}

function validateEnvExample() {
  const envExample = fs.readFileSync(path.join(projectRoot, '.env.example'), 'utf8');
  const expectedKeys = [
    'NODE_ENV',
    'PORT',
    'JSON_BODY_LIMIT',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'AUTH_RATE_LIMIT_MAX_REQUESTS',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'CORS_ORIGIN',
  ];

  const missingKeys = expectedKeys.filter((key) => !envExample.includes(`${key}=`));

  if (missingKeys.length > 0) {
    throw new Error(`.env.example is missing keys:\n- ${missingKeys.join('\n- ')}`);
  }
}

function main() {
  assertFilesExist();
  validateEnvExample();
  checkSyntax(collectJavaScriptFiles(path.join(projectRoot, 'src')));

  console.log('Smoke check passed.');
}

main();
