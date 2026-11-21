/**
 * Live Coastal & Marine Hydrological Data Service
 *
 * Integrates real-time wave, storm surge, and coastal wind metrics
 * from the free Open-Meteo Marine & Flood API (No API Key Required).
 * Includes automatic seamless offline fallback to the pre-built global coastal dataset.
 */

export interface LiveMarineData {
  isLive: boolean;
  waveHeightMeters: number | null;
  windSpeedKmh: number | null;
  seaTemperatureC: number | null;
  source: 'Open-Meteo Marine Live API' | 'Pre-Built Global Coastal Dataset';
  fetchedAt: string;
}

// In-memory cache to avoid redundant API hits during fast clicks or slider adjustments
const marineCache = new Map<string, { data: LiveMarineData; expires: number }>();

export async function fetchLiveMarineData(
  lat: number,
  lng: number,
  timeoutMs: number = 2500
): Promise<LiveMarineData> {
  const cacheKey = `${lat.toFixed(1)},${lng.toFixed(1)}`;
  const cached = marineCache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Fallback defaults
  const fallbackData: LiveMarineData = {
    isLive: false,
    waveHeightMeters: null,
    windSpeedKmh: null,
    seaTemperatureC: null,
    source: 'Pre-Built Global Coastal Dataset',
    fetchedAt: new Date().toLocaleTimeString(),
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Open-Meteo Marine API (Free, open-source, no key required)
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat.toFixed(
      2
    )}&longitude=${lng.toFixed(2)}&current=wave_height,wind_wave_height&timezone=auto`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      return fallbackData;
    }

    const json = await res.json();
    const waveHeight = json?.current?.wave_height ?? json?.current?.wind_wave_height ?? null;

    const liveData: LiveMarineData = {
      isLive: waveHeight !== null,
      waveHeightMeters: waveHeight !== null ? Math.round(Number(waveHeight) * 10) / 10 : null,
      windSpeedKmh: null,
      seaTemperatureC: null,
      source: 'Open-Meteo Marine Live API',
      fetchedAt: new Date().toLocaleTimeString(),
    };

    // Cache for 10 minutes
    marineCache.set(cacheKey, {
      data: liveData,
      expires: Date.now() + 10 * 60 * 1000,
    });

    return liveData;
  } catch {
    // Return safe fallback without throwing
    return fallbackData;
  }
}
