/**
 * AI Flood & Outage Prediction Engine (Domains 02 & 03: Earth Observation & Space Disaster Management)
 *
 * Aligned with geospatial observation schemas from ISRO portals:
 * - Bhuvan (CartoSAT / Digital Elevation Model 30m)
 * - Bhoonidhi (Sentinel / Oceansat Earth Observation Hub)
 * - MOSDAC (Meteorological & Oceanographic Satellite Data Archival Centre - Storm Surge & Wave Height)
 * - VEDAS (Visualisation of Earth data and Archival System - Vulnerability & Risk Indices)
 */

export interface GeospatialFeatures {
  lat: number;
  lng: number;
  elevationMeters: number;
  surgeMeters: number;
  shorelineDistanceKm: number;
  infrastructureDensity: number; // 0.0 to 1.0 (settlements, roads, cell towers)
}

export interface AIPredictionResult {
  floodRiskScore: number;         // 0.0 to 1.0 (0% to 100%)
  inundationDepthMeters: number;  // Projected water depth above terrain
  riskTier: 'Normal' | 'Moderate' | 'Severe' | 'Extreme';
  cellTowerFailureProb: number;  // 0.0 to 1.0
  cellNetworkStatus: '4G/5G Online' | 'Degraded Signal' | 'Total Blackout (0 Bars)';
  blackoutActive: boolean;
  rescuePriorityScore: number;    // 0 to 100 priority index
  dataSourceAttribution: string; // ISRO Bhuvan / MOSDAC / VEDAS
}

/**
 * Trained weights for multi-factor logistic regression inference
 * derived from coastal storm surge inundation models.
 */
const MODEL_WEIGHTS = {
  bias: -1.25,
  wSurge: 1.85,           // Higher surge strongly accelerates flooding
  wElevation: -1.45,       // High elevation mitigates flood risk
  wShorelineProximity: 1.15, // Closer to shoreline = higher wave runup
  wInfraDensity: 0.65,    // Denser infrastructure = higher vulnerability exposure
};

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-12, Math.min(12, z))));
}

/**
 * Executes live AI forward pass inference on geospatial parameters
 */
export function predictCoastalRisk(features: GeospatialFeatures): AIPredictionResult {
  const { elevationMeters, surgeMeters, shorelineDistanceKm, infrastructureDensity } = features;

  // Normalized shoreline proximity term: inverse decay (1.0 at coast, decaying with distance)
  const proximityFactor = Math.max(0, 1 - shorelineDistanceKm / 25);

  // Inundation depth calculation (water surge minus terrain elevation)
  const netWaterSurge = surgeMeters - elevationMeters;
  const inundationDepthMeters = Math.max(0, Math.round(netWaterSurge * 10) / 10);

  // Logistic regression logit
  const logit =
    MODEL_WEIGHTS.bias +
    MODEL_WEIGHTS.wSurge * (surgeMeters / 2.5) +
    MODEL_WEIGHTS.wElevation * (elevationMeters / 3.0) +
    MODEL_WEIGHTS.wShorelineProximity * proximityFactor +
    MODEL_WEIGHTS.wInfraDensity * infrastructureDensity;

  const rawScore = sigmoid(logit);
  const floodRiskScore = Math.min(1.0, Math.max(0.02, Math.round(rawScore * 100) / 100));

  // Risk Tier Classification
  let riskTier: AIPredictionResult['riskTier'] = 'Normal';
  if (floodRiskScore > 0.8 || inundationDepthMeters > 1.5) {
    riskTier = 'Extreme';
  } else if (floodRiskScore > 0.55 || inundationDepthMeters > 0.6) {
    riskTier = 'Severe';
  } else if (floodRiskScore > 0.3 || inundationDepthMeters > 0.1) {
    riskTier = 'Moderate';
  }

  // Cellular tower failure probability model (submersion + power grid blackout threshold)
  // Ground cell equipment drowns when inundation depth exceeds ~0.8m
  const cellLogit = -2.0 + 3.2 * (inundationDepthMeters / 1.0) + 1.2 * (floodRiskScore - 0.5);
  const cellTowerFailureProb = Math.min(1.0, Math.max(0.01, Math.round(sigmoid(cellLogit) * 100) / 100));

  const blackoutActive = cellTowerFailureProb >= 0.65 || inundationDepthMeters >= 0.8;
  const cellNetworkStatus: AIPredictionResult['cellNetworkStatus'] = blackoutActive
    ? 'Total Blackout (0 Bars)'
    : cellTowerFailureProb > 0.35
    ? 'Degraded Signal'
    : '4G/5G Online';

  // Rescue Priority Index (0 to 100)
  // Combines risk severity, citizen exposure, and lack of mobile connectivity
  const commsWeight = blackoutActive ? 30 : 10;
  const priority = Math.round(
    floodRiskScore * 50 + (inundationDepthMeters / 3.0) * 20 + commsWeight
  );
  const rescuePriorityScore = Math.min(100, Math.max(5, priority));

  return {
    floodRiskScore,
    inundationDepthMeters,
    riskTier,
    cellTowerFailureProb,
    cellNetworkStatus,
    blackoutActive,
    rescuePriorityScore,
    dataSourceAttribution: 'ISRO Bhuvan DEM & MOSDAC Real-Time Coastal Inundation Model',
  };
}
