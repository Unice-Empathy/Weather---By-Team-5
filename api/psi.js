/**
 * Standalone Vercel Serverless Function: /api/psi
 * Proxies and normalizes real-time PSI air quality data from:
 * https://api-open.data.gov.sg/v2/real-time/api/psi
 */
import { handlePsiRequest } from './open-data-service.js';

export default async function handler(req, res) {
  return handlePsiRequest(req, res);
}
