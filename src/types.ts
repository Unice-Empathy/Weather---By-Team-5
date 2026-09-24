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

export interface FourDayForecastItem {
  day: string;
  timestamp: string;
  condition: string;
  summary: string;
  tempLow: number;
  tempHigh: number;
  humidityLow: number;
  humidityHigh: number;
  windDirection: string;
  windSpeedLow: number;
  windSpeedHigh: number;
}

export interface FourDayOutlookData {
  records?: Array<{
    date?: string;
    updatedTimestamp?: string;
    forecasts: FourDayForecastItem[];
  }>;
  forecasts?: FourDayForecastItem[];
}

export interface UvReading {
  hour: string;
  value: number;
}

export interface UvData {
  index: number;
  level: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  color: string;
  description: string;
  history?: UvReading[];
}

export interface Pm25Data {
  value: number;
  band: 'Normal' | 'Elevated' | 'High' | 'Very High';
  color: string;
  description: string;
  regions?: Record<string, number>;
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
  uv?: UvData;
  pm25?: Pm25Data;
  forecast: ForecastItem[];
  fourDayOutlook?: FourDayForecastItem[];
  fourDayForecast?: FourDayForecastItem[];
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
  totalEndpoints?: number;
  activeFeeds?: Array<{
    endpoint: string;
    id: string;
    cached: boolean;
    status: number | string;
  }>;
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

export interface ApiEndpointItem {
  key: string;
  id: string;
  name: string;
  category: string;
  url: string;
  apiPath: string;
  description: string;
  cached: boolean;
  status: number | string;
  lastUpdated: string | null;
}

export interface ApiDirectoryResponse {
  totalEndpoints: number;
  endpoints: ApiEndpointItem[];
  timestamp: string;
}

export interface StationReadingItem {
  stationId: string;
  name?: string;
  value: number;
  unit?: string;
}
