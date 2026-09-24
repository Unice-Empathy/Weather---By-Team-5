export interface ForecastItem {
  time: string;
  fullTime?: string;
  temperature: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  rainfall?: string;
  condition: string;
  rainChance?: number;
}

export interface WeatherData {
  location: string;
  region?: string;
  country?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  rainfall: string;
  windSpeed: number;
  forecast: ForecastItem[];
  lastUpdated: string;
}

export interface WeatherErrorResponse {
  error: string;
  upstreamStatus?: number;
}

export interface HealthData {
  keyConfigured: boolean;
  providerOk: boolean;
  upstreamStatus: number | null;
  message?: string;
}

export interface AreaForecast {
  area: string;
  forecast: string;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface TwoHourForecastData {
  source: string;
  updatedTimestamp: string;
  validPeriod: {
    start: string;
    end: string;
    text: string;
  };
  totalAreas: number;
  summary: {
    thunderyCount: number;
    showeryCount: number;
    thunderyAreas: string[];
    showeryAreas: string[];
  };
  forecasts: AreaForecast[];
}

export interface PsiRegionDetail {
  region: string;
  psi: number;
  pm25: number;
  pm10: number;
  band: string;
  color: string;
  description: string;
}

export interface PsiData {
  source: string;
  updatedTimestamp: string;
  date: string;
  maxPsi: number;
  overallBand: string;
  overallDescription: string;
  regions: Record<string, PsiRegionDetail>;
  rawReadings?: Record<string, Record<string, number>>;
}

