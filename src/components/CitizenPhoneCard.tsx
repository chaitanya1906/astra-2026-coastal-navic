import React, { useState } from 'react';
import {
  Smartphone,
  SignalZero,
  Signal,
  Satellite,
  CheckCircle2,
  LifeBuoy,
  Users,
  MapPin,
  Cpu,
  Radio,
} from 'lucide-react';
import { CountryRegion } from '../data/worldCountries';
import { DisasterRescueState } from '../simulation/disasterRescueModel';
import { AIPredictionResult } from '../simulation/aiFloodModel';
import { NavICEmergencyPacket } from '../simulation/navicRelay';

export interface InspectedLocation {
  lat: number;
  lng: number;
  name: string;
  isCustomClick: boolean;
  elevationMeters: number;
  riskLevel: 'Normal' | 'Moderate' | 'Severe' | 'Extreme';
}

interface CitizenPhoneCardProps {
  selectedCountry: CountryRegion;
  disasterState: DisasterRescueState;
  inspectedLocation?: InspectedLocation | null;
  aiPrediction: AIPredictionResult;
  navicPacket: NavICEmergencyPacket;
  onTriggerSos: () => void;
}

export const CitizenPhoneCard: React.FC<CitizenPhoneCardProps> = ({
  selectedCountry,
  inspectedLocation,
  aiPrediction,
  navicPacket,
  onTriggerSos,
}) => {
  const [minimized, setMinimized] = useState(false);
  const citizen = selectedCountry.strandedCitizen;

  const currentLat = inspectedLocation ? inspectedLocation.lat : citizen.lat;
  const currentLng = inspectedLocation ? inspectedLocation.lng : citizen.lng;
  const currentName = inspectedLocation ? inspectedLocation.name : citizen.name;
  const currentElev = inspectedLocation ? inspectedLocation.elevationMeters : citizen.elevationMeters;

  const isCellOnline = !aiPrediction.blackoutActive;
  const isRescueDispatched = navicPacket.rescueStatus === 'Rescue Vessel Dispatched';

  return (
    <div className="absolute top-20 right-4 md:right-6 pointer-events-auto z-20 font-sans text-xs">
      <div className="flex justify-end mb-1.5">
        <button
          onClick={() => setMinimized(!minimized)}
          className="text-[11px] text-slate-400 hover:text-white bg-zinc-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
        >
          {minimized ? 'Show Citizen Telemetry' : 'Minimize'}
        </button>
      </div>

      {!minimized && (
        <div className="w-80 bg-zinc-950/85 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl space-y-3.5 border border-white/10 text-slate-200">
          {/* Handset Top Status Bar */}
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5 text-[11px] font-mono">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Stranded Citizen Handset</span>
            </span>
            {isCellOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Signal className="w-3 h-3" /> 4G Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
                <SignalZero className="w-3.5 h-3.5" /> 0 Bars (Blackout)
              </span>
            )}
          </div>

          {/* Inspected / Selected Location Telemetry */}
          <div className="p-3 rounded-2xl bg-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                {inspectedLocation?.isCustomClick ? 'Target Coordinate:' : 'Active Rescue Zone:'}
              </span>
              <span className="text-sky-300 tabular-nums font-mono font-bold">
                {currentLat.toFixed(2)}°N, {currentLng.toFixed(2)}°E
              </span>
            </div>
            <div className="text-white font-medium text-xs leading-snug">{currentName}</div>
            <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1.5 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-amber-400" />
                <span>{citizen.peopleCount} Stranded Citizens</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                Elev: {currentElev.toFixed(1)}m
              </span>
            </div>
          </div>

          {/* AI Observation & Inundation Assessment Box */}
          <div className="p-3 rounded-2xl bg-sky-950/30 border border-sky-400/20 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-sky-400 font-bold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> AI Inundation Model
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  aiPrediction.riskTier === 'Extreme'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : aiPrediction.riskTier === 'Severe'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {aiPrediction.riskTier} Risk ({Math.round(aiPrediction.floodRiskScore * 100)}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex justify-between pt-0.5">
              <span>Predicted Water Depth:</span>
              <strong className="text-white font-mono">+{aiPrediction.inundationDepthMeters.toFixed(1)}m</strong>
            </div>
            <div className="text-[11px] text-slate-300 flex justify-between">
              <span>Tower Failure Chance:</span>
              <strong className={aiPrediction.blackoutActive ? 'text-rose-400' : 'text-emerald-400'}>
                {Math.round(aiPrediction.cellTowerFailureProb * 100)}% ({aiPrediction.cellNetworkStatus})
              </strong>
            </div>
          </div>

          {/* Emergency Alert Banner */}
          <div
            className={`p-3 rounded-2xl text-xs leading-relaxed ${
              isRescueDispatched
                ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/40'
                : isCellOnline
                ? 'bg-white/5 text-slate-300'
                : 'bg-rose-500/15 text-rose-200 border border-rose-500/30'
            }`}
          >
            {isRescueDispatched ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">NavIC Emergency Uplink Active</strong>
                  Distress beacon packet confirmed. Rescue craft ETA: {navicPacket.rescueEtaMinutes} mins.
                </div>
              </div>
            ) : isCellOnline ? (
              <span>Mobile towers functioning. Coastal flood warning monitoring in progress.</span>
            ) : (
              <div>
                <strong className="block text-rose-300 font-semibold mb-0.5">Cellular Blackout (0 Bars)</strong>
                Land cell towers drowned! AI dispatched automatic NavIC off-grid emergency beacon.
              </div>
            )}
          </div>

          {/* SOS Trigger Button / Rescue Indicator */}
          {!isRescueDispatched ? (
            <button
              onClick={onTriggerSos}
              className="w-full py-3 rounded-xl font-bold text-xs bg-sky-400 hover:bg-sky-300 active:scale-[0.98] text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
            >
              <Satellite className="w-4 h-4 animate-pulse" />
              <span>SEND SATELLITE SOS PING</span>
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-center text-xs font-semibold flex items-center justify-center gap-2">
              <LifeBuoy className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Rescue Vessel En Route (ETA ~{navicPacket.rescueEtaMinutes}m)</span>
            </div>
          )}

          {/* NavIC Satellite Constellation Channel Info */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span className="flex items-center gap-1 text-sky-300">
              <Radio className="w-3 h-3 text-sky-400" /> {navicPacket.frequencyBand}
            </span>
            <span>Packet: {navicPacket.packetId}</span>
          </div>
        </div>
      )}
    </div>
  );
};
