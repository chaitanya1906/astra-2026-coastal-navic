import React from 'react';
import {
  MapPin,
  Signal,
  SignalZero,
  Satellite,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Users,
} from 'lucide-react';
import { CoastalLocation } from '../data/globalCoastalDataset';
import { AIPredictionResult } from '../simulation/aiFloodModel';
import { NavICEmergencyPacket } from '../simulation/navicRelay';
import { LiveMarineData } from '../services/liveCoastalFeed';

interface RightDrawerProps {
  location: CoastalLocation;
  isOpenOceanClick?: boolean;
  clickedCoords?: { lat: number; lng: number } | null;
  aiPrediction: AIPredictionResult;
  navicPacket: NavICEmergencyPacket;
  liveMarine: LiveMarineData;
  onSendSos: () => void;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  location,
  isOpenOceanClick,
  clickedCoords,
  aiPrediction,
  navicPacket,
  liveMarine,
  onSendSos,
}) => {
  const isRescueActive = navicPacket.rescueStatus === 'Rescue Vessel Dispatched';
  const displayLat = clickedCoords ? clickedCoords.lat : location.lat;
  const displayLng = clickedCoords ? clickedCoords.lng : location.lng;

  // Risk colour helpers
  const riskColor =
    aiPrediction.riskTier === 'Extreme'
      ? 'text-rose-400'
      : aiPrediction.riskTier === 'Severe'
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <aside className="absolute top-20 right-4 z-20 pointer-events-auto font-sans select-none w-72">
      {/* Single slim backdrop panel — no heavy card borders */}
      <div className="bg-zinc-950/70 backdrop-blur-2xl rounded-3xl px-5 py-4 shadow-2xl space-y-3.5 text-slate-200 text-xs">

        {/* ── LOCATION HEADER ─────────────────────────────────────── */}
        <div className="space-y-0.5">
          {/* coords + hub type */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" />
              {isOpenOceanClick ? 'Open Ocean → Nearest Hub' : 'Coastal Hub'}
            </span>
            <span className="text-sky-400 tabular-nums font-medium">
              {displayLat.toFixed(2)}°&thinsp;{displayLng.toFixed(2)}°
            </span>
          </div>

          {/* location name + risk badge */}
          <div className="flex items-start justify-between gap-2 pt-1">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{location.flag}</span>
                <span className="leading-tight">{location.city.split(' (')[0]}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {location.country} · {location.continent}
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wide mt-0.5 shrink-0 ${riskColor}`}>
              {aiPrediction.riskTier}
            </span>
          </div>

          {isOpenOceanClick && (
            <p className="text-[10px] text-sky-400/70 leading-snug pt-0.5">
              Click was out at sea — snapped to nearest active coastline hub.
            </p>
          )}
        </div>

        {/* ── THIN RULE ────────────────────────────────────────────── */}
        <div className="h-px bg-white/[0.07]" />

        {/* ── AI METRICS: inline rows, no box backgrounds ──────────── */}
        <div className="space-y-2">
          {/* Flood inundation */}
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Flood Inundation</span>
            <span className="font-bold text-white font-mono tabular-nums">
              +{aiPrediction.inundationDepthMeters.toFixed(1)} m
              <span className="text-amber-400 font-normal text-[10px] ml-1.5">
                AI {Math.round(aiPrediction.floodRiskScore * 100)}%
              </span>
            </span>
          </div>

          {/* Mobile signal */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Mobile Signal</span>
            {!aiPrediction.blackoutActive ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                <Signal className="w-3.5 h-3.5" /> 4G Online
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px] animate-pulse">
                <SignalZero className="w-3.5 h-3.5" /> 0 Bars — Dead
              </span>
            )}
          </div>

          {/* Population + elevation */}
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              Exposed: <strong className="text-slate-200 ml-1">{location.coastalPopulation}</strong>
            </span>
            <span>
              Elev: <strong className="text-slate-200">
                {location.elevationMeters > 0 ? `+${location.elevationMeters}` : location.elevationMeters}m
              </strong>
            </span>
            {liveMarine.waveHeightMeters !== null && (
              <span>
                Swell: <strong className="text-sky-300">{liveMarine.waveHeightMeters}m</strong>
              </span>
            )}
          </div>
        </div>

        {/* ── THIN RULE ────────────────────────────────────────────── */}
        <div className="h-px bg-white/[0.07]" />

        {/* ── NAVIC STATUS: colour-coded inline, no bordered box ───── */}
        <div className="text-[11px] leading-snug">
          {isRescueActive ? (
            <div className="flex items-start gap-1.5 text-cyan-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">NavIC Satellite Linked —</strong>{' '}
                Rescue vessel dispatched. ETA ~{navicPacket.rescueEtaMinutes} min.
              </span>
            </div>
          ) : !aiPrediction.blackoutActive ? (
            <div className="text-slate-400">
              <strong className="text-slate-200">Ground Signal Active:</strong> Towers operational.
              NavIC off-grid channel on standby.
            </div>
          ) : (
            <div className="flex items-start gap-1.5 text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-rose-200">Cellular Grid Down (0 Bars) —</strong>{' '}
                Flood surge overwhelmed telecom. Send NavIC distress ping below.
              </span>
            </div>
          )}
        </div>

        {/* ── SOS BUTTON ───────────────────────────────────────────── */}
        {!isRescueActive ? (
          <button
            onClick={onSendSos}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(56,189,248,0.5)] transition-all cursor-pointer"
          >
            <Satellite className="w-4 h-4 animate-pulse" />
            SEND NAVIC SATELLITE SOS
          </button>
        ) : (
          <div className="text-center text-xs text-cyan-300 font-semibold flex items-center justify-center gap-2 py-1">
            <LifeBuoy className="w-4 h-4 animate-spin text-cyan-400" />
            NavIC Rescue En Route (ETA ~{navicPacket.rescueEtaMinutes} min)
          </div>
        )}

        {/* ── FOOTER: frequency + packet id ────────────────────────── */}
        <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono">
          <span className="flex items-center gap-1 text-slate-500">
            <Radio className="w-2.5 h-2.5 text-sky-500" /> NavIC L5 · 1176.45 MHz
          </span>
          <span>PKT {navicPacket.packetId}</span>
        </div>
      </div>
    </aside>
  );
};
