import 'server-only';
import { createClient } from '@sanity/client';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';

export function getSanityDataset(): string {
  return (
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    (isProductionEnvironment ? 'production' : 'development')
  );
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-project-id';
const dataset = getSanityDataset();
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-01';
const token =
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_API_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN;

export function isSanityConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder_project_id' &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder-project-id' &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id_here'
  );
}

export function getSanityWriteClient() {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN environment variable is required for write operations');
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: writeToken,
  });
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: isProductionEnvironment,
  token,
});
