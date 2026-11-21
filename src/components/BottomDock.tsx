import React from 'react';
import { Signal, SignalZero, Satellite, Waves } from 'lucide-react';

interface BottomDockProps {
  currentStep: 1 | 2 | 3;
  surgeMeters: number;
  onChangeSurge: (val: number) => void;
  onClickStep: (step: 1 | 2 | 3) => void;
  mobileStatus: string;
  navicStatus: string;
}

const STEPS: {
  id: 1 | 2 | 3;
  label: string;
  desc: string;
  activeLabel: string;
  activeBorder: string;
  activeText: string;
  idleText: string;
  dot: string;
}[] = [
  {
    id: 1,
    label: 'Step 1 — Flood Watch',
    desc: 'Satellites scan coastlines and highlight low-lying zones at risk before the cyclone arrives.',
    activeLabel: 'text-amber-400',
    activeBorder: 'border-t-amber-400/60',
    activeText: 'text-amber-100',
    idleText: 'text-slate-500',
    dot: 'bg-amber-400',
  },
  {
    id: 2,
    label: 'Step 2 — Storm & Blackout',
    desc: 'Rising water floods coastal towns. Cell towers drown — citizens lose all mobile signal (0 Bars).',
    activeLabel: 'text-rose-400',
    activeBorder: 'border-t-rose-400/60',
    activeText: 'text-rose-100',
    idleText: 'text-slate-500',
    dot: 'bg-rose-400',
  },
  {
    id: 3,
    label: 'Step 3 — NavIC Rescue',
    desc: 'Satellites link directly to stranded phones, transmit GPS coordinates, guide rescue vessels in.',
    activeLabel: 'text-cyan-400',
    activeBorder: 'border-t-cyan-400/60',
    activeText: 'text-cyan-100',
    idleText: 'text-slate-500',
    dot: 'bg-cyan-400',
  },
];

export const BottomDock: React.FC<BottomDockProps> = ({
  currentStep,
  surgeMeters,
  onChangeSurge,
  onClickStep,
  mobileStatus,
  navicStatus,
}) => {
  const isMobileDown =
    mobileStatus.toLowerCase().includes('down') ||
    mobileStatus.toLowerCase().includes('outage') ||
    mobileStatus.toLowerCase().includes('0 bars') ||
    mobileStatus.toLowerCase().includes('blackout') ||
    mobileStatus.toLowerCase().includes('failed');

  const isRescueActive = navicStatus.toLowerCase().includes('dispatched');

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto font-sans select-none w-[min(96vw,820px)]">
      <div className="bg-zinc-950/70 backdrop-blur-2xl rounded-3xl px-5 pt-0 pb-4 shadow-2xl">

        {/* ── PROGRESS TRACK ─────────────────────────────────────────── */}
        <div className="flex gap-1 mb-3">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => onClickStep(s.id)}
              className={`flex-1 h-[3px] rounded-full transition-all duration-500 cursor-pointer ${
                currentStep >= s.id ? s.dot : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* ── STEP COLUMNS: borderless, text only ────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {STEPS.map((step) => {
            const active = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onClickStep(step.id)}
                className="text-left transition-all group"
              >
                {/* label row */}
                <div
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 transition-colors ${
                    active ? step.activeLabel : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                >
                  {/* coloured dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 transition-all ${
                      active ? step.dot : 'bg-white/15'
                    }`}
                  />
                  {step.label}
                </div>
                {/* description — only slightly visible when idle */}
                <p
                  className={`text-[11px] leading-snug transition-colors ${
                    active ? step.activeText : step.idleText + ' group-hover:text-slate-400'
                  }`}
                >
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── THIN RULE ──────────────────────────────────────────────── */}
        <div className="h-px bg-white/[0.06] mb-3" />

        {/* ── SURGE SLIDER + STATUS ROW ───────────────────────────────── */}
        <div className="flex items-center gap-4">
          {/* Surge slider */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Waves className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap shrink-0">Storm surge:</span>
            <input
              type="range"
              min={0}
              max={6}
              step={0.1}
              value={surgeMeters}
              onChange={(e) => onChangeSurge(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-sky-400 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-sky-300 tabular-nums font-bold w-12 text-right shrink-0">
              +{surgeMeters.toFixed(1)} m
            </span>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-white/10 shrink-0" />

          {/* Mobile status */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono whitespace-nowrap shrink-0">
            {isMobileDown ? (
              <>
                <SignalZero className="w-3 h-3 text-rose-400" />
                <span className="text-rose-400 font-bold">Mobile Down</span>
              </>
            ) : (
              <>
                <Signal className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Mobile OK</span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-white/10 shrink-0" />

          {/* NavIC rescue status */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono whitespace-nowrap shrink-0">
            <Satellite className={`w-3 h-3 ${isRescueActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={isRescueActive ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
              {isRescueActive ? 'Rescue En Route' : 'NavIC Standby'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
