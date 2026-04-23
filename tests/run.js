require('./setup-env');

const fs = require('node:fs');
const path = require('node:path');

function loadSuites(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.test.js'))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => require(path.join(directory, entry.name)));
}

const suites = [
  ...loadSuites(path.join(__dirname, 'unit')),
  ...loadSuites(path.join(__dirname, 'integration')),
];

const filter = process.argv[2] || 'all';

async function run() {
  let total = 0;
  let failed = 0;

  for (const suite of suites) {
    if (filter !== 'all' && suite.type !== filter) {
      continue;
    }

    console.log(`\n${suite.name}`);

    for (const testCase of suite.tests) {
      total += 1;

      try {
        await testCase.run();
        console.log(`  [PASS] ${testCase.name}`);
      } catch (error) {
        failed += 1;
        console.log(`  [FAIL] ${testCase.name}`);
        console.error(error);
      }
    }
  }

  console.log(`\nExecuted ${total} tests, ${failed} failed.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
