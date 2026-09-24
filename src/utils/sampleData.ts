import { WeatherData } from '../types';

export const SAMPLE_SINGAPORE_WEATHER: WeatherData = {
  location: "Singapore",
  region: "Central Singapore",
  country: "Singapore",
  temperature: 31,
  feelsLike: 35,
  humidity: 74,
  condition: "Partly cloudy",
  rainfall: "0.2 mm",
  windSpeed: 14,
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  forecast: [
    { time: "09:00", temperature: 29, feelsLike: 33, humidity: 78, windSpeed: 10, rainfall: "0 mm", condition: "Sunny", rainChance: 10 },
    { time: "11:00", temperature: 31, feelsLike: 35, humidity: 74, windSpeed: 12, rainfall: "0 mm", condition: "Partly cloudy", rainChance: 15 },
    { time: "13:00", temperature: 33, feelsLike: 38, humidity: 68, windSpeed: 15, rainfall: "0 mm", condition: "Partly cloudy", rainChance: 25 },
    { time: "15:00", temperature: 32, feelsLike: 37, humidity: 72, windSpeed: 16, rainfall: "1.2 mm", condition: "Thundery Showers", rainChance: 65 },
    { time: "17:00", temperature: 29, feelsLike: 33, humidity: 82, windSpeed: 14, rainfall: "0.5 mm", condition: "Light Rain", rainChance: 45 },
    { time: "19:00", temperature: 28, feelsLike: 31, humidity: 84, windSpeed: 11, rainfall: "0 mm", condition: "Cloudy", rainChance: 20 },
    { time: "21:00", temperature: 27, feelsLike: 30, humidity: 86, windSpeed: 9, rainfall: "0 mm", condition: "Clear", rainChance: 10 },
    { time: "23:00", temperature: 27, feelsLike: 29, humidity: 88, windSpeed: 8, rainfall: "0 mm", condition: "Clear", rainChance: 5 },
    { time: "01:00", temperature: 26, feelsLike: 28, humidity: 89, windSpeed: 8, rainfall: "0 mm", condition: "Clear", rainChance: 5 },
    { time: "03:00", temperature: 26, feelsLike: 28, humidity: 90, windSpeed: 7, rainfall: "0 mm", condition: "Partly cloudy", rainChance: 10 },
    { time: "05:00", temperature: 25, feelsLike: 27, humidity: 92, windSpeed: 7, rainfall: "0 mm", condition: "Partly cloudy", rainChance: 10 },
    { time: "07:00", temperature: 27, feelsLike: 29, humidity: 85, windSpeed: 9, rainfall: "0 mm", condition: "Sunny", rainChance: 15 }
  ]
};
