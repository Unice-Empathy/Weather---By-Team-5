/**
 * Standalone Vercel Serverless Function: /api/two-hr-forecast
 * Proxies and normalizes real-time Singapore 2-Hour Nowcast from:
 * https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
 */
import { handleTwoHourForecastRequest } from './open-data-service.js';

export default async function handler(req, res) {
  return handleTwoHourForecastRequest(req, res);
}
