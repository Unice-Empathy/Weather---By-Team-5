/**
 * Shared service for Singapore Data.gov.sg Real-Time APIs:
 * - 2-Hour Weather Forecast: https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
 * - Pollutant Standards Index (PSI): https://api-open.data.gov.sg/v2/real-time/api/psi
 */

const TWO_HR_FORECAST_URL = "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast";
const PSI_URL = "https://api-open.data.gov.sg/v2/real-time/api/psi";

/**
 * Categorize Singapore PSI reading according to NEA standards:
 * 0 - 50: Good
 * 51 - 100: Moderate
 * 101 - 200: Unhealthy
 * 201 - 300: Very Unhealthy
 * > 300: Hazardous
 */
export function getPsiBand(psiValue) {
  const val = Number(psiValue) || 0;
  if (val <= 50) return { band: "Good", color: "emerald", desc: "Normal outdoor activities" };
  if (val <= 100) return { band: "Moderate", color: "cyan", desc: "Normal outdoor activities" };
  if (val <= 200) return { band: "Unhealthy", color: "amber", desc: "Reduce prolonged/strenuous outdoor exertion" };
  if (val <= 300) return { band: "Very Unhealthy", color: "orange", desc: "Avoid prolonged/strenuous outdoor exertion" };
  return { band: "Hazardous", color: "rose", desc: "Minimise outdoor exposure" };
}

/**
 * Retrieve Singapore 2-Hour Nowcast from Data.gov.sg
 */
export async function fetchTwoHourForecast(areaFilter = "") {
  try {
    const response = await fetch(TWO_HR_FORECAST_URL, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        status: response.status >= 500 ? response.status : 502,
        body: {
          error: "Singapore 2-Hour Forecast service unavailable",
          upstreamStatus: response.status
        }
      };
    }

    const payload = await response.json();
    const data = payload.data || {};
    const item = Array.isArray(data.items) && data.items.length > 0 ? data.items[0] : {};
    const areaMetaMap = new Map();

    if (Array.isArray(data.area_metadata)) {
      for (const m of data.area_metadata) {
        if (m.name) {
          areaMetaMap.set(m.name.toLowerCase(), m.label_location || null);
        }
      }
    }

    const rawForecasts = Array.isArray(item.forecasts) ? item.forecasts : [];
    const formattedForecasts = rawForecasts.map((f) => {
      const areaName = f.area || "Unknown Area";
      const location = areaMetaMap.get(areaName.toLowerCase()) || null;
      return {
        area: areaName,
        forecast: f.forecast || "Fair",
        location
      };
    });

    // Optional area query filter
    const query = (areaFilter || "").trim().toLowerCase();
    const filteredForecasts = query
      ? formattedForecasts.filter((f) => f.area.toLowerCase().includes(query))
      : formattedForecasts;

    // Detect thundery and shower clusters
    const thunderyAreas = formattedForecasts
      .filter((f) => f.forecast.toLowerCase().includes("thunder"))
      .map((f) => f.area);

    const showeryAreas = formattedForecasts
      .filter((f) => f.forecast.toLowerCase().includes("shower") || f.forecast.toLowerCase().includes("rain"))
      .map((f) => f.area);

    return {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600"
      },
      body: {
        source: "Data.gov.sg / National Environment Agency",
        updatedTimestamp: item.update_timestamp || item.timestamp || new Date().toISOString(),
        validPeriod: item.valid_period || {
          start: "",
          end: "",
          text: "Current 2-hour window"
        },
        totalAreas: formattedForecasts.length,
        summary: {
          thunderyCount: thunderyAreas.length,
          showeryCount: showeryAreas.length,
          thunderyAreas,
          showeryAreas
        },
        forecasts: filteredForecasts
      }
    };
  } catch (err) {
    return {
      status: 502,
      body: {
        error: "Failed to connect to Data.gov.sg 2-hour forecast",
        upstreamStatus: 502
      }
    };
  }
}

/**
 * Retrieve Singapore Pollutant Standards Index (PSI) from Data.gov.sg
 */
export async function fetchPsiData() {
  try {
    const response = await fetch(PSI_URL, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        status: response.status >= 500 ? response.status : 502,
        body: {
          error: "Singapore PSI service unavailable",
          upstreamStatus: response.status
        }
      };
    }

    const payload = await response.json();
    const data = payload.data || {};
    const item = Array.isArray(data.items) && data.items.length > 0 ? data.items[0] : {};
    const readings = item.readings || {};

    const psi24 = readings.psi_twenty_four_hourly || {};
    const pm25 = readings.pm25_twenty_four_hourly || {};
    const pm10 = readings.pm10_twenty_four_hourly || {};

    const regionsList = ["central", "north", "south", "east", "west"];
    let maxPsi = 0;
    const regionSummary = {};

    for (const r of regionsList) {
      const val = Number(psi24[r]) || 0;
      if (val > maxPsi) maxPsi = val;
      const bandInfo = getPsiBand(val);

      regionSummary[r] = {
        region: r.charAt(0).toUpperCase() + r.slice(1),
        psi: val,
        pm25: Number(pm25[r]) || 0,
        pm10: Number(pm10[r]) || 0,
        band: bandInfo.band,
        color: bandInfo.color,
        description: bandInfo.desc
      };
    }

    const overallBand = getPsiBand(maxPsi);

    return {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600"
      },
      body: {
        source: "Data.gov.sg / National Environment Agency",
        updatedTimestamp: item.updatedTimestamp || item.timestamp || new Date().toISOString(),
        date: item.date || new Date().toISOString().slice(0, 10),
        maxPsi,
        overallBand: overallBand.band,
        overallDescription: overallBand.desc,
        regions: regionSummary,
        rawReadings: readings
      }
    };
  } catch (err) {
    return {
      status: 502,
      body: {
        error: "Failed to connect to Data.gov.sg PSI",
        upstreamStatus: 502
      }
    };
  }
}

/**
 * Unified request handler for /api/two-hr-forecast
 */
export async function handleTwoHourForecastRequest(req, res) {
  let area = "";

  if (req.query && req.query.area) {
    area = String(req.query.area);
  } else if (req.url) {
    try {
      const url = new URL(req.url, "http://localhost");
      const a = url.searchParams.get("area");
      if (a) area = a;
    } catch (_) {
      // ignore
    }
  }

  const result = await fetchTwoHourForecast(area);

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }

  return res.status(result.status).json(result.body);
}

/**
 * Unified request handler for /api/psi
 */
export async function handlePsiRequest(_req, res) {
  const result = await fetchPsiData();

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }

  return res.status(result.status).json(result.body);
}
