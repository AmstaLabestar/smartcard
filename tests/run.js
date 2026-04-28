require('./setup-env');

const suites = [
  require('./unit/card.service.test'),
  require('./unit/purchase-request.service.test'),
  require('./unit/transaction.service.test'),
  require('./unit/validators.test'),
  require('./integration/app.integration.test'),
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
