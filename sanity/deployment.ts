import { dataset, projectId, apiVersion } from './env';

/**
 * Expected CORS origins required for Sanity Studio and client API requests
 * in local development and production environments.
 */
export const ALLOWED_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://marylandbeeratlas.com',
  'https://www.marylandbeeratlas.com',
];

/**
 * Validates production studio deployment configuration and CORS origins settings.
 */
export function validateStudioDeploymentConfig() {
  const isProjectIdConfigured = projectId !== 'placeholder-project-id';

  return {
    projectId,
    dataset,
    apiVersion,
    isProjectIdConfigured,
    allowedOrigins: ALLOWED_CORS_ORIGINS,
    studioBasePath: '/studio',
  };
}
