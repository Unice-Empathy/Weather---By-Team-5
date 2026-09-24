/**
 * Standalone Vercel Serverless Function: /api/health
 * Reports configuration and provider upstream status without revealing credentials.
 */
import { handleHealthRequest } from './weather-service.js';

export default async function handler(req, res) {
  return handleHealthRequest(req, res);
}
