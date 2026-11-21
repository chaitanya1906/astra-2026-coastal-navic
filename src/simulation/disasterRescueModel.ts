import { CountryRegion, StrandedCitizenPin } from '../data/worldCountries';

export type GuidedStep = 1 | 2 | 3;

export interface DisasterRescueState {
  currentStep: GuidedStep;
  stormSurgeMeters: number;       // 0m to 6m
  mobileGridOnline: boolean;      // Step 2 & 3: Mobile towers submerged/offline
  satelliteRelayLocked: boolean;  // Step 3: Satellite connects to blackout zone
  rescueDispatched: boolean;      // Step 3: Emergency response team en route
  activeSosPing: StrandedCitizenPin | null;
}

export function evaluateDisasterState(
  selectedCountry: CountryRegion,
  step: GuidedStep,
  manualSurgeMeters?: number,
  sosTriggered?: boolean
): DisasterRescueState {
  let surge = 0;
  if (manualSurgeMeters !== undefined) {
    surge = manualSurgeMeters;
  } else {
    if (step === 1) surge = 0.5;
    if (step === 2) surge = 3.8;
    if (step === 3) surge = 4.5;
  }

  const mobileGridOnline = surge < 2.0;
  const satelliteRelayLocked = step === 3 || surge >= 2.0;
  const rescueDispatched = step === 3 || !!sosTriggered;

  const citizen: StrandedCitizenPin = {
    ...selectedCountry.strandedCitizen,
    status: rescueDispatched
      ? 'Satellite Rescue Dispatched'
      : surge > selectedCountry.strandedCitizen.elevationMeters
      ? 'Cut Off (Water Rising)'
      : 'Safe',
  };

  return {
    currentStep: step,
    stormSurgeMeters: Math.round(surge * 10) / 10,
    mobileGridOnline,
    satelliteRelayLocked,
    rescueDispatched,
    activeSosPing: citizen,
  };
}
