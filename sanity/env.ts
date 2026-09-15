export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-01';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  (isProductionEnvironment ? 'production' : 'development');

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-project-id';
