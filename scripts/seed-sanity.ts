import { seedSanityDataset } from '../lib/sanity/seed';

async function main() {
  const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
  try {
    const result = await seedSanityDataset({ dryRun: isDryRun });
    if (result.dryRun) {
      console.log('\n✅ Dry-run validation complete. All baseline document structures are valid.');
    } else {
      console.log(`\n✅ Live seeding complete. Committed ${result.documentCount} documents to Sanity.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed with error:', err);
    process.exit(1);
  }
}

main();
