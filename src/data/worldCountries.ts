/**
 * Global Coastal Hotspots, Shorelines & Country Coordinates.
 */

export interface CoastalCity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  population: string;
  floodRiskLevel: 'High' | 'Severe' | 'Extreme';
}

export interface MobileCellTower {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevationMeters: number;
}

export interface StrandedCitizenPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  peopleCount: number;
  elevationMeters: number;
  status: 'Safe' | 'Cut Off (Water Rising)' | 'Satellite Rescue Dispatched';
}

export interface CountryRegion {
  id: string;
  name: string;
  continent: string;
  flag: string;
  lat: number;
  lng: number;
  zoomDistance: number;
  summary: string;
  coastalCities: CoastalCity[];
  mobileTowers: MobileCellTower[];
  strandedCitizen: StrandedCitizenPin;
}

/**
 * Converts (lat, lng) in degrees to 3D sphere coordinate [x, y, z] matching Three.js equirectangular standard
 */
export function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

/**
 * Converts a 3D unit sphere point back to (lat, lng) in degrees
 */
export function vector3ToLatLng(point: { x: number; y: number; z: number }): { lat: number; lng: number } {
  const normalized = {
    x: point.x,
    y: point.y,
    z: point.z,
  };
  const len = Math.hypot(normalized.x, normalized.y, normalized.z) || 1.0;
  const ny = Math.max(-1.0, Math.min(1.0, normalized.y / len));
  const lat = 90 - Math.acos(ny) * (180 / Math.PI);

  // x = -sin(phi)*cos(theta), z = sin(phi)*sin(theta)
  // atan2(z, -x) = theta = (lng + 180) * PI / 180
  let theta = Math.atan2(normalized.z, -normalized.x); // [-PI, PI]
  if (theta < 0) theta += 2 * Math.PI; // [0, 2*PI]
  let lng = (theta * 180) / Math.PI - 180; // [-180, 180]
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;

  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
  };
}

/**
 * Finds the closest predefined coastal region to a given (lat, lng)
 */
export function findClosestRegion(lat: number, lng: number): CountryRegion {
  let closest = COASTAL_COUNTRIES[0];
  let minDistanceSq = Infinity;

  for (const c of COASTAL_COUNTRIES) {
    const dLat = c.lat - lat;
    const dLng = c.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = c;
    }
  }

  return closest;
}

export const COASTAL_COUNTRIES: CountryRegion[] = [
  {
    id: 'india',
    name: 'India (Bay of Bengal & Odisha Coast)',
    continent: 'Asia',
    flag: '🇮🇳',
    lat: 18.5,
    lng: 84.5,
    zoomDistance: 2.35,
    summary: 'Densely populated coastal delta vulnerable to severe tropical cyclones and Bay of Bengal storm surges.',
    coastalCities: [
      { id: 'in-puri', name: 'Puri Coast', lat: 19.8, lng: 85.8, elevationMeters: 1.8, population: '250,000', floodRiskLevel: 'Extreme' },
      { id: 'in-vizag', name: 'Visakhapatnam Port', lat: 17.7, lng: 83.3, elevationMeters: 3.5, population: '2.1M', floodRiskLevel: 'High' },
      { id: 'in-chennai', name: 'Chennai Estuary', lat: 13.1, lng: 80.3, elevationMeters: 2.2, population: '7.1M', floodRiskLevel: 'Severe' },
      { id: 'in-paradip', name: 'Paradip Port & Delta', lat: 20.3, lng: 86.6, elevationMeters: 1.2, population: '110,000', floodRiskLevel: 'Extreme' },
    ],
    mobileTowers: [
      { id: 'tow-in-1', name: 'Tower Puri Beach 4G', lat: 19.79, lng: 85.82, elevationMeters: 1.5 },
      { id: 'tow-in-2', name: 'Tower Paradip Sunderbans 4G', lat: 20.28, lng: 86.62, elevationMeters: 1.1 },
      { id: 'tow-in-3', name: 'Tower Vizag Hill 5G', lat: 17.72, lng: 83.31, elevationMeters: 8.5 },
    ],
    strandedCitizen: {
      id: 'cit-in-1',
      name: 'Rameshwaram Coastal Fishermen Community',
      lat: 19.75,
      lng: 85.85,
      peopleCount: 12,
      elevationMeters: 1.4,
      status: 'Cut Off (Water Rising)',
    },
  },

  {
    id: 'bangladesh',
    name: 'Bangladesh (Ganges-Meghna Delta)',
    continent: 'Asia',
    flag: '🇧🇩',
    lat: 22.3,
    lng: 90.5,
    zoomDistance: 2.35,
    summary: 'The world’s largest low-lying mangrove delta, where storm surges penetrate tens of kilometers inland.',
    coastalCities: [
      { id: 'bd-cox', name: "Cox's Bazar", lat: 21.4, lng: 91.9, elevationMeters: 2.0, population: '350,000', floodRiskLevel: 'Extreme' },
      { id: 'bd-chittagong', name: 'Chittagong Port', lat: 22.3, lng: 91.8, elevationMeters: 3.1, population: '5.2M', floodRiskLevel: 'Severe' },
      { id: 'bd-khulna', name: 'Khulna Sundarbans', lat: 22.8, lng: 89.5, elevationMeters: 1.1, population: '1.5M', floodRiskLevel: 'Extreme' },
    ],
    mobileTowers: [
      { id: 'tow-bd-1', name: 'Tower Delta Marine 4G', lat: 21.5, lng: 91.8, elevationMeters: 1.2 },
      { id: 'tow-bd-2', name: 'Tower Sundarbans Silt 4G', lat: 22.6, lng: 89.6, elevationMeters: 1.0 },
    ],
    strandedCitizen: {
      id: 'cit-bd-1',
      name: 'Khepupara Mangrove Farmers',
      lat: 21.9,
      lng: 90.2,
      peopleCount: 18,
      elevationMeters: 1.0,
      status: 'Cut Off (Water Rising)',
    },
  },

  {
    id: 'netherlands',
    name: 'Netherlands (North Sea Lowlands)',
    continent: 'Europe',
    flag: '🇳🇱',
    lat: 52.5,
    lng: 5.2,
    zoomDistance: 2.25,
    summary: 'Extensive low-lying polders lying below sea level, protected by sea dykes vulnerable to North Sea storm surges.',
    coastalCities: [
      { id: 'nl-rotterdam', name: 'Rotterdam Sea Port', lat: 51.9, lng: 4.5, elevationMeters: -1.5, population: '650,000', floodRiskLevel: 'Severe' },
      { id: 'nl-amsterdam', name: 'Amsterdam Lowland', lat: 52.4, lng: 4.9, elevationMeters: -2.0, population: '880,000', floodRiskLevel: 'High' },
      { id: 'nl-zeeland', name: 'Zeeland Estuary', lat: 51.5, lng: 3.8, elevationMeters: -1.0, population: '380,000', floodRiskLevel: 'Extreme' },
    ],
    mobileTowers: [
      { id: 'tow-nl-1', name: 'Tower Maasvlakte Sea 5G', lat: 51.95, lng: 4.05, elevationMeters: 0.8 },
      { id: 'tow-nl-2', name: 'Tower Zeeland Dykes 5G', lat: 51.52, lng: 3.75, elevationMeters: 0.5 },
    ],
    strandedCitizen: {
      id: 'cit-nl-1',
      name: 'Zeeland Polder Dairy Farm',
      lat: 51.58,
      lng: 3.92,
      peopleCount: 6,
      elevationMeters: -0.5,
      status: 'Cut Off (Water Rising)',
    },
  },

  {
    id: 'usa',
    name: 'United States (Florida Gulf Coast)',
    continent: 'Americas',
    flag: '🇺🇸',
    lat: 27.5,
    lng: -82.5,
    zoomDistance: 2.35,
    summary: 'Low-elevation peninsula exposed to Atlantic hurricanes, storm surges, and extensive mobile grid failures.',
    coastalCities: [
      { id: 'us-tampa', name: 'Tampa Bay', lat: 27.9, lng: -82.5, elevationMeters: 1.5, population: '3.1M', floodRiskLevel: 'Extreme' },
      { id: 'us-miami', name: 'Miami Beach', lat: 25.8, lng: -80.1, elevationMeters: 1.0, population: '2.7M', floodRiskLevel: 'Extreme' },
      { id: 'us-keywest', name: 'Key West Islands', lat: 24.5, lng: -81.8, elevationMeters: 0.8, population: '26,000', floodRiskLevel: 'Extreme' },
    ],
    mobileTowers: [
      { id: 'tow-us-1', name: 'Tower Tampa Causeway 5G', lat: 27.92, lng: -82.55, elevationMeters: 0.9 },
      { id: 'tow-us-2', name: 'Tower Miami Key 5G', lat: 25.75, lng: -80.16, elevationMeters: 0.6 },
    ],
    strandedCitizen: {
      id: 'cit-us-1',
      name: 'Sanibel Island Evacuees',
      lat: 26.44,
      lng: -82.09,
      peopleCount: 9,
      elevationMeters: 0.7,
      status: 'Cut Off (Water Rising)',
    },
  },

  {
    id: 'japan',
    name: 'Japan (Tokyo Bay & Pacific Coast)',
    continent: 'Asia',
    flag: '🇯🇵',
    lat: 35.5,
    lng: 139.8,
    zoomDistance: 2.35,
    summary: 'Island archipelago vulnerable to Pacific typhoons, storm surges, and tsunami-induced coastal inundation.',
    coastalCities: [
      { id: 'jp-tokyo', name: 'Tokyo Bay Delta', lat: 35.6, lng: 139.8, elevationMeters: 2.1, population: '14.0M', floodRiskLevel: 'Severe' },
      { id: 'jp-osaka', name: 'Osaka Waterfront', lat: 34.6, lng: 135.4, elevationMeters: 1.3, population: '2.7M', floodRiskLevel: 'Extreme' },
      { id: 'jp-nagoya', name: 'Nagoya Lowlands', lat: 35.1, lng: 136.9, elevationMeters: 1.0, population: '2.3M', floodRiskLevel: 'Extreme' },
    ],
    mobileTowers: [
      { id: 'tow-jp-1', name: 'Tower Tokyo Waterfront 5G', lat: 35.62, lng: 139.78, elevationMeters: 1.2 },
      { id: 'tow-jp-2', name: 'Tower Osaka Port 5G', lat: 34.65, lng: 135.42, elevationMeters: 0.8 },
    ],
    strandedCitizen: {
      id: 'cit-jp-1',
      name: 'Chiba Coastal Fishing Harbor',
      lat: 35.32,
      lng: 139.9,
      peopleCount: 14,
      elevationMeters: 1.1,
      status: 'Cut Off (Water Rising)',
    },
  },

  {
    id: 'indonesia',
    name: 'Indonesia (Jakarta & Java Coast)',
    continent: 'Asia',
    flag: '🇮🇩',
    lat: -6.2,
    lng: 106.8,
    zoomDistance: 2.35,
    summary: 'Rapidly subsiding coastal megacity where high tides and storm surges cause routine urban inundation.',
    coastalCities: [
      { id: 'id-jakarta', name: 'North Jakarta Basin', lat: -6.12, lng: 106.8, elevationMeters: -0.8, population: '10.5M', floodRiskLevel: 'Extreme' },
      { id: 'id-semarang', name: 'Semarang North Coast', lat: -6.95, lng: 110.4, elevationMeters: 0.5, population: '1.8M', floodRiskLevel: 'Extreme' },
      { id: 'id-surabaya', name: 'Surabaya Port', lat: -7.2, lng: 112.7, elevationMeters: 1.8, population: '3.0M', floodRiskLevel: 'High' },
    ],
    mobileTowers: [
      { id: 'tow-id-1', name: 'Tower Muara Baru Port 4G', lat: -6.11, lng: 106.81, elevationMeters: -0.4 },
      { id: 'tow-id-2', name: 'Tower Tanjung Priok 4G', lat: -6.1, lng: 106.88, elevationMeters: 0.2 },
    ],
    strandedCitizen: {
      id: 'cit-id-1',
      name: 'Muara Baru Polder Settlement',
      lat: -6.11,
      lng: 106.8,
      peopleCount: 22,
      elevationMeters: -0.2,
      status: 'Cut Off (Water Rising)',
    },
  },
];
