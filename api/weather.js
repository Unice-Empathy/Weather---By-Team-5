/**
 * Standalone Vercel Serverless Function: /api/weather
 * Retrieves live Singapore weather condition, temperature, humidity, rainfall, wind, and forecast.
 */
import { handleWeatherRequest } from './weather-service.js';

export default async function handler(req, res) {
  return handleWeatherRequest(req, res);
}
