import './setup-env';
import { isSanityConfigured } from '../lib/sanity/client';
import { SanityBreweryRepository } from '../lib/repositories/sanity/brewery';
import { SanityTrailRepository } from '../lib/repositories/sanity/trail';
import { SanityGuideRepository } from '../lib/repositories/sanity/guide';
import { auditBreweryDataset, DatasetAuditReport } from '../lib/validations/quality';
import { Brewery, BeerTrail, TravelGuide } from '../lib/types';

// Force non-mock production data mode for this script
process.env.USE_MOCK_DATA = 'false';

/**
 * Maryland Beer Atlas - Production Brewery Data Audit Script
 *
 * Repeatable pre-release audit tool running against the canonical production
 * data source (Sanity CMS) without mock data fallbacks.
 */

async function main() {
  const args = process.argv.slice(2);
  const isJsonMode = args.includes('--json');
  const isStrict = args.includes('--strict');

  if (!isJsonMode) {
    console.log('\n================================================================');
    console.log('       MARYLAND BEER ATLAS - PRODUCTION DATA AUDIT REPORT       ');
    console.log('================================================================\n');
  }

  // 1. Check Sanity CMS Configuration
  if (!isSanityConfigured()) {
    if (isJsonMode) {
      console.log(
        JSON.stringify(
          {
            error: 'SANITY_NOT_CONFIGURED',
            message:
              'Sanity CMS environment variables are not configured (NEXT_PUBLIC_SANITY_PROJECT_ID is missing or set to placeholder). Set NEXT_PUBLIC_SANITY_PROJECT_ID to audit production data.',
          },
          null,
          2
        )
      );
    } else {
      console.warn('⚠️  CANONICAL PRODUCTION DATA SOURCE UNCONFIGURED');
      console.warn(
        '----------------------------------------------------------------'
      );
      console.warn(
        'The production data audit operates strictly against the canonical Sanity CMS'
      );
      console.warn(
        'production dataset without mock data fallbacks.\n'
      );
      console.warn(
        'To run an audit against live production data, configure your environment:'
      );
      console.warn('  export NEXT_PUBLIC_SANITY_PROJECT_ID="your-sanity-project-id"');
      console.warn('  export NEXT_PUBLIC_SANITY_DATASET="production"');
      console.warn('  export SANITY_API_TOKEN="your-read-token" (optional)\n');
      console.warn(
        'Then execute:\n  npm run audit:breweries\n'
      );
    }
    process.exit(isStrict ? 1 : 0);
  }

  // 2. Fetch Production Datasets
  let breweries: Brewery[] = [];
  let trails: BeerTrail[] = [];
  let guides: TravelGuide[] = [];

  try {
    const breweryRepo = new SanityBreweryRepository();
    const trailRepo = new SanityTrailRepository();
    const guideRepo = new SanityGuideRepository();

    if (!isJsonMode) {
      console.log(' fetching canonical production records from Sanity CMS...');
    }

    [breweries, trails, guides] = await Promise.all([
      breweryRepo.getAll().catch(() => []),
      trailRepo.getAll().catch(() => []),
      guideRepo.getAll().catch(() => []),
    ]);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (isJsonMode) {
      console.log(JSON.stringify({ error: 'FETCH_FAILED', message: errorMsg }));
    } else {
      console.error('\n❌ Failed to query Sanity CMS production datasets:');
      console.error(`   ${errorMsg}\n`);
    }
    process.exit(1);
  }

  // 3. Execute Production Data Quality Audit
  const targetDate = new Date();
  const report: DatasetAuditReport = auditBreweryDataset(breweries, targetDate, trails, guides);

  // 4. Render Output
  if (isJsonMode) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReadableReport(report);
  }

  // 5. Evaluate Exit Code
  const hasCriticalFailures =
    report.invalidRecordsCount > 0 ||
    report.duplicates.length > 0 ||
    report.brokenReferences.length > 0;

  if (isStrict && hasCriticalFailures) {
    if (!isJsonMode) {
      console.error(
        '\n❌ Audit failed in strict mode due to critical schema errors, duplicates, or broken references.'
      );
    }
    process.exit(1);
  }

  process.exit(0);
}

function printHumanReadableReport(report: DatasetAuditReport) {
  console.log(`📅 Audit Date: ${report.targetDate}`);
  console.log(`📊 Summary Metrics Dashboard:`);
  console.log(`  ------------------------------------------------------------`);
  console.log(`  Total Records Evaluated : ${report.totalRecords}`);
  console.log(`  Valid Brewery Records   : ${report.validRecordsCount}`);
  console.log(`  Invalid Schema Records  : ${report.invalidRecordsCount}`);
  console.log(`  Attribute Duplicates    : ${report.duplicates.length}`);
  console.log(`  Close Coordinates (<50m): ${report.closeCoordinates.length}`);
  console.log(`  Invalid Coordinates     : ${report.invalidCoordinates.length}`);
  console.log(`  Hours Issues / Missing  : ${report.invalidHours.length}`);
  console.log(`  Missing Web/Contact/Img : ${report.missingContactAndMedia.length}`);
  console.log(`  Verification Issues     : ${report.verificationIssues.length}`);
  console.log(`  Closed/Inactive Status  : ${report.closedOrInactiveCount}`);
  console.log(`  Incomplete Records      : ${report.incompleteRecordsCount}`);
  console.log(`  Broken References       : ${report.brokenReferences.length}`);
  console.log(`  Avg Completeness Score  : ${report.averageCompletenessScore} / 100`);
  console.log(`  ------------------------------------------------------------\n`);

  // Section 1: Schema Validation Errors
  if (report.invalidRecords.length > 0) {
    console.log(`❌ INVALID SCHEMA RECORDS (${report.invalidRecords.length})`);
    console.log(`   Action: Fix missing required schema properties in Sanity CMS.\n`);
    report.invalidRecords.forEach((item, i) => {
      console.log(`   ${i + 1}. [ID: ${item.id || 'N/A'}] ${item.name || 'Unnamed'}`);
      console.log(`      Error: ${item.error}`);
    });
    console.log('');
  }

  // Section 2: Duplicate Records
  if (report.duplicates.length > 0) {
    console.log(`⚠️  DUPLICATE BREWERIES DETECTED (${report.duplicates.length})`);
    console.log(`   Action: Merge or deduplicate records in Sanity CMS.\n`);
    report.duplicates.forEach((d, i) => {
      console.log(`   ${i + 1}. "${d.breweryName}" [${d.breweryId}]`);
      console.log(`      Duplicates: "${d.duplicateOfName}" [${d.duplicateOfId}]`);
      console.log(`      Reason: ${d.matchReason} (${d.details})`);
    });
    console.log('');
  }

  // Section 3: Close Coordinates (< 50m)
  if (report.closeCoordinates.length > 0) {
    console.log(`📍 CLOSE DUPLICATE COORDINATES (<50 meters) (${report.closeCoordinates.length})`);
    console.log(`   Action: Confirm taproom locations or adjust pin coordinates in Sanity CMS.\n`);
    report.closeCoordinates.forEach((c, i) => {
      console.log(`   ${i + 1}. "${c.brewery1Name}" [${c.brewery1Id}] vs "${c.brewery2Name}" [${c.brewery2Id}]`);
      console.log(`      Distance: ${c.distanceMeters} meters apart`);
      console.log(`      Coords: (${c.brewery1Coords.lat}, ${c.brewery1Coords.lng}) vs (${c.brewery2Coords.lat}, ${c.brewery2Coords.lng})`);
    });
    console.log('');
  }

  // Section 4: Missing or Invalid Coordinates
  if (report.invalidCoordinates.length > 0) {
    console.log(`🗺️  MISSING / OUT-OF-BOUNDS COORDINATES (${report.invalidCoordinates.length})`);
    console.log(`   Action: Provide valid latitude/longitude within Maryland in Sanity CMS.\n`);
    report.invalidCoordinates.forEach((coord, i) => {
      console.log(`   ${i + 1}. "${coord.breweryName}" [${coord.breweryId}]`);
      console.log(`      Issue: ${coord.reason}`);
      console.log(`      Details: ${coord.details}`);
    });
    console.log('');
  }

  // Section 5: Hours Issues
  if (report.invalidHours.length > 0) {
    console.log(`⏰ MISSING OR INVALID HOURS (${report.invalidHours.length})`);
    console.log(`   Action: Populate structured 24h operating hours in Sanity CMS.\n`);
    report.invalidHours.forEach((h, i) => {
      console.log(`   ${i + 1}. "${h.breweryName}" [${h.breweryId}]`);
      console.log(`      Issue: ${h.issueType}`);
      console.log(`      Details: ${h.details}`);
    });
    console.log('');
  }

  // Section 6: Missing Contact Info & Images
  if (report.missingContactAndMedia.length > 0) {
    console.log(`📞 MISSING CONTACT INFO OR IMAGES (${report.missingContactAndMedia.length})`);
    console.log(`   Action: Update website, phone, image asset, or social links in Sanity CMS.\n`);
    report.missingContactAndMedia.forEach((m, i) => {
      const missingList: string[] = [];
      if (m.missingWebsite) missingList.push('Website');
      if (m.missingPhone) missingList.push('Phone');
      if (m.missingImage) missingList.push('Image');
      if (m.missingSocialLinks) missingList.push('Social Links');

      console.log(`   ${i + 1}. "${m.breweryName}" [${m.breweryId}]`);
      if (missingList.length > 0) {
        console.log(`      Missing: ${missingList.join(', ')}`);
      }
      if (m.invalidUrls.length > 0) {
        console.log(`      Invalid URLs: ${m.invalidUrls.join('; ')}`);
      }
    });
    console.log('');
  }

  // Section 7: Data Freshness & Verification
  if (report.verificationIssues.length > 0) {
    console.log(`🔍 STALE OR UNVERIFIED RECORDS (${report.verificationIssues.length})`);
    console.log(`   Action: Re-verify taproom details and update lastVerified date in Sanity CMS.\n`);
    report.verificationIssues.forEach((v, i) => {
      console.log(`   ${i + 1}. "${v.breweryName}" [${v.breweryId}]`);
      console.log(`      Category: ${v.freshnessCategory} (${v.issue})`);
      console.log(`      Details: ${v.details}`);
    });
    console.log('');
  }

  // Section 8: Closed / Inactive Breweries
  if (report.closedOrInactiveBreweries.length > 0) {
    console.log(`🚫 CLOSED / INACTIVE BREWERIES (${report.closedOrInactiveBreweries.length})`);
    console.log(`   Action: Monitor status notes or verify permanent closure in Sanity CMS.\n`);
    report.closedOrInactiveBreweries.forEach((c, i) => {
      console.log(`   ${i + 1}. "${c.name}" [${c.id}] - Status: ${c.status}`);
      if (c.statusNotes) console.log(`      Notes: ${c.statusNotes}`);
    });
    console.log('');
  }

  // Section 9: Broken Reference Integrity
  if (report.brokenReferences.length > 0) {
    console.log(`🔗 BROKEN TRAIL / GUIDE BREWERY REFERENCES (${report.brokenReferences.length})`);
    console.log(`   Action: Update dangling brewery references in Sanity CMS trails/guides.\n`);
    report.brokenReferences.forEach((r, i) => {
      console.log(`   ${i + 1}. Source: ${r.sourceType.toUpperCase()} "${r.sourceName}" [${r.sourceIdOrSlug}]`);
      console.log(`      Referenced Brewery Ref: "${r.referencedBreweryRef}" (Not Found)`);
      console.log(`      Location: ${r.locationDetails}`);
    });
    console.log('');
  }

  // Final Health Rating
  console.log('================================================================');
  if (
    report.invalidRecordsCount === 0 &&
    report.duplicates.length === 0 &&
    report.brokenReferences.length === 0
  ) {
    console.log('✅ AUDIT PASSED: No critical schema, duplicate, or reference errors.');
  } else {
    console.log('⚠️  AUDIT WARNINGS DETECTED: Address flagged items before release.');
  }
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
