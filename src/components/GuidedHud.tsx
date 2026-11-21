import React from 'react';
import {
  Satellite,
  Waves,
  WifiOff,
  LifeBuoy,
  ShieldAlert,
  MapPin,
  Cpu,
  Radio,
} from 'lucide-react';
import { COASTAL_COUNTRIES, CountryRegion } from '../data/worldCountries';
import { GuidedStep, DisasterRescueState } from '../simulation/disasterRescueModel';
import { InspectedLocation } from './CitizenPhoneCard';
import { AIPredictionResult } from '../simulation/aiFloodModel';
import { NavICEmergencyPacket } from '../simulation/navicRelay';

interface GuidedHudProps {
  selectedCountry: CountryRegion;
  onSelectCountry: (country: CountryRegion) => void;
  disasterState: DisasterRescueState;
  inspectedLocation?: InspectedLocation | null;
  aiPrediction: AIPredictionResult;
  navicPacket: NavICEmergencyPacket;
  onChangeStep: (step: GuidedStep) => void;
  manualSurgeMeters: number;
  onChangeSurgeMeters: (val: number) => void;
}

export const GuidedHud: React.FC<GuidedHudProps> = ({
  selectedCountry,
  onSelectCountry,
  inspectedLocation,
  aiPrediction,
  navicPacket,
  onChangeStep,
  manualSurgeMeters,
  onChangeSurgeMeters,
}) => {
  const currentStep = disasterStateToStep(aiPrediction, navicPacket);

  function disasterStateToStep(ai: AIPredictionResult, navic: NavICEmergencyPacket): GuidedStep {
    if (navic.rescueStatus === 'Rescue Vessel Dispatched') return 3;
    if (ai.blackoutActive) return 2;
    return 1;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none font-sans">
      {/* 1. TOP HEADER & COUNTRY SELECTOR (Floating, borderless glass strip) */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-zinc-950/70 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl pointer-events-auto border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] shrink-0">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-widest text-sky-400 uppercase font-mono font-bold">
                ASTRA 2026
              </span>
              <span className="text-[9px] tracking-wider text-slate-400 font-mono uppercase px-1.5 py-0.5 rounded bg-white/5">
                DOMAINS 02, 03 & 04 (ISRO BHUVAN + NAVIC)
              </span>
            </div>
            <h1 className="text-sm font-semibold text-white tracking-wide">
              Satellite Coastal Flood Risk & NavIC Rescue Platform
            </h1>
          </div>
        </div>

        {/* Global Country / Region Selector with clean pill buttons */}
        <div className="flex items-center flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl">
          <span className="text-xs text-slate-400 px-2 font-mono hidden sm:inline">Country:</span>
          {COASTAL_COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCountry(c)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedCountry.id === c.id
                  ? 'bg-sky-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name.split(' (')[0]}</span>
            </button>
          ))}
        </div>
      </header>

      {/* 2. PLAIN-ENGLISH COLOR LEGEND & REAL-TIME AI PREDICTION READOUT */}
      <div className="self-start mt-2 flex flex-col gap-2 pointer-events-auto">
        {/* Telemetry pill */}
        <div className="bg-zinc-950/70 backdrop-blur-xl px-4 py-2 rounded-xl text-xs shadow-2xl flex items-center gap-4 text-slate-200">
          <span className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
            Live Telemetry:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            <span className="text-xs">Flood Risk Zone</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
            <span className="text-xs">Cell Tower Blackout</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="text-xs">NavIC SOS Link</span>
          </div>
        </div>

        {/* Live AI Inference telemetry badge */}
        <div className="bg-zinc-950/65 backdrop-blur-md px-3.5 py-2 rounded-xl text-[11px] text-slate-200 flex items-center gap-3 shadow-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-sky-400 font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Risk:</span>
            <strong className="text-white tabular-nums">{Math.round(aiPrediction.floodRiskScore * 100)}%</strong>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-amber-300 font-mono">
            <span>Inundation:</span>
            <strong className="text-white tabular-nums">+{aiPrediction.inundationDepthMeters.toFixed(1)}m</strong>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">NavIC Relay:</span>
            <strong className={navicPacket.satelliteRelayLocked ? 'text-cyan-400' : 'text-slate-400'}>
              {navicPacket.rescueStatus}
            </strong>
          </div>
        </div>

        {/* Click to inspect prompt */}
        <div className="bg-zinc-950/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] text-sky-300/90 flex items-center gap-2 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          {inspectedLocation?.isCustomClick ? (
            <span>
              Target locked: <strong className="text-white">{inspectedLocation.name}</strong>
            </span>
          ) : (
            <span>Click any location on the 3D globe to run real-time AI flood risk & NavIC rescue routing.</span>
          )}
        </div>
      </div>

      {/* 3. 3-STEP GUIDED STORY BAR (Borderless Floating Strip with sleek progress line) */}
      <footer className="mt-4 bg-zinc-950/75 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-3 relative overflow-hidden">
        {/* Top Active Progress Bar Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-cyan-400 transition-all duration-500"
            style={{
              width: currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : '100%',
            }}
          />
        </div>

        {/* Step Items - Borderless Floating Typography separated by Hairlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* STEP 1 */}
          <button
            onClick={() => onChangeStep(1)}
            className={`px-4 py-2.5 text-left transition-all flex flex-col gap-1 rounded-xl ${
              currentStep === 1 ? 'bg-amber-500/10' : 'hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className={currentStep === 1 ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
                1. SATELLITE FLOOD WATCH
              </span>
              <ShieldAlert className={`w-4 h-4 ${currentStep === 1 ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              AI evaluates digital elevation & storm surge to highlight vulnerable coastal cities in <strong className="text-amber-300">amber/red</strong> before cyclones hit.
            </p>
          </button>

          {/* STEP 2 */}
          <button
            onClick={() => onChangeStep(2)}
            className={`px-4 py-2.5 text-left transition-all flex flex-col gap-1 rounded-xl ${
              currentStep === 2 ? 'bg-rose-500/10' : 'hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className={currentStep === 2 ? 'text-rose-300 font-semibold' : 'text-slate-300'}>
                2. STORM & MOBILE BLACKOUT
              </span>
              <WifiOff className={`w-4 h-4 ${currentStep === 2 ? 'text-rose-400' : 'text-slate-500'}`} />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Storm surge rises; land cell towers submerge and shut down, leaving victims with <strong className="text-rose-300">0 Bars (No Signal)</strong>.
            </p>
          </button>

          {/* STEP 3 */}
          <button
            onClick={() => onChangeStep(3)}
            className={`px-4 py-2.5 text-left transition-all flex flex-col gap-1 rounded-xl ${
              currentStep === 3 ? 'bg-cyan-500/10' : 'hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className={currentStep === 3 ? 'text-cyan-300 font-semibold' : 'text-slate-300'}>
                3. NAVIC GUIDES RESCUE
              </span>
              <LifeBuoy className={`w-4 h-4 ${currentStep === 3 ? 'text-cyan-400' : 'text-slate-500'}`} />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Overhead NavIC satellites lock onto distress packets, transmit exact coordinates, and guide rescue vessels to the target.
            </p>
          </button>
        </div>

        {/* Live Simulation Controls & Telemetry Readouts */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2.5 border-t border-white/10 gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300 font-mono">
            <Waves className="w-4 h-4 text-sky-400" />
            <span>Simulate Coastal Flood Height:</span>
            <input
              type="range"
              min="0.2"
              max="5.5"
              step="0.1"
              value={manualSurgeMeters}
              onChange={(e) => onChangeSurgeMeters(Number(e.target.value))}
              className="w-40 accent-sky-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
            <span className="text-white font-bold tabular-nums">+{manualSurgeMeters.toFixed(1)}m</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Mobile Grid:</span>
              <strong className={!aiPrediction.blackoutActive ? 'text-emerald-400' : 'text-rose-400'}>
                {aiPrediction.cellNetworkStatus}
              </strong>
            </span>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>NavIC Link:</span>
              <strong className={navicPacket.distressBeaconActive ? 'text-cyan-400' : 'text-amber-400'}>
                {navicPacket.rescueStatus}
              </strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
