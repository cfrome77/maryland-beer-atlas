import { seedSanityDataset, SeedOptions } from '../lib/sanity/seed';

async function main() {
  const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

  let mode: 'development' | 'production' | 'auto' = 'auto';
  if (process.argv.includes('--dev') || process.argv.includes('--development')) {
    mode = 'development';
  } else if (process.argv.includes('--prod') || process.argv.includes('--production')) {
    mode = 'production';
  }

  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  let limit: number | undefined;
  if (limitArg) {
    const val = parseInt(limitArg.split('=')[1], 10);
    if (!isNaN(val) && val > 0) {
      limit = val;
    }
  }

  const options: SeedOptions = {
    dryRun: isDryRun,
    mode,
    limit,
  };

  try {
    const result = await seedSanityDataset(options);
    if (result.dryRun) {
      console.log(`\n✅ Dry-run validation complete (${result.mode.toUpperCase()} mode). ${result.documentCount} document structures validated.`);
    } else {
      console.log(`\n✅ Live seeding complete (${result.mode.toUpperCase()} mode). Committed ${result.documentCount} documents to Sanity.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed with error:', err);
    process.exit(1);
  }
}

main();
