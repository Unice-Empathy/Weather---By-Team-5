import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleConsolidatedWeather,
  handleNeaHealth,
  handleTwoHrForecast,
  handleTwentyFourHrForecast,
  handleFourDayOutlook,
  handleAirTemperature,
  handleRainfall,
  handlePsi,
  handlePm25,
  handleUv,
  handleRelativeHumidity,
  handleWindSpeed,
  handleAllEndpointsSummary
} from './api/nea-service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // 10 Official Singapore Data.gov.sg / NEA Real-Time Open Data Endpoints
  app.get('/api/two-hr-forecast', handleTwoHrForecast);
  app.get('/api/twenty-four-hr-forecast', handleTwentyFourHrForecast);
  app.get('/api/four-day-outlook', handleFourDayOutlook);
  app.get('/api/air-temperature', handleAirTemperature);
  app.get('/api/rainfall', handleRainfall);
  app.get('/api/psi', handlePsi);
  app.get('/api/pm25', handlePm25);
  app.get('/api/uv', handleUv);
  app.get('/api/relative-humidity', handleRelativeHumidity);
  app.get('/api/wind-speed', handleWindSpeed);

  // Consolidated Weather & Diagnostic Endpoints
  app.get('/api/weather', handleConsolidatedWeather);
  app.get('/api/health', handleNeaHealth);
  app.get('/api/all-endpoints', handleAllEndpointsSummary);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singapore Weather Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
