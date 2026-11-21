import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Search,
  ChevronDown,
  Activity,
  Layers,
} from 'lucide-react';
import { CoastalLocation, GLOBAL_COASTAL_DATASET } from '../data/globalCoastalDataset';
import { LiveMarineData } from '../services/liveCoastalFeed';

interface TopNavProps {
  selectedLocation: CoastalLocation;
  onSelectLocation: (loc: CoastalLocation) => void;
  liveMarine: LiveMarineData;
}

// Popular quick-jump locations
const QUICK_PICKS = [
  { country: 'India', id: 'in-puri' },
  { country: 'Bangladesh', id: 'bd-khulna' },
  { country: 'Netherlands', id: 'nl-rotterdam' },
  { country: 'USA', id: 'us-miami' },
  { country: 'Japan', id: 'jp-tokyo' },
  { country: 'Brazil', id: 'br-recife' },
  { country: 'Indonesia', id: 'id-jakarta' },
];

export const TopNav: React.FC<TopNavProps> = ({
  selectedLocation,
  onSelectLocation,
  liveMarine,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Dropdown anchor position (fixed, so it escapes any overflow: hidden parent)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filteredLocations = GLOBAL_COASTAL_DATASET.filter((loc) => {
    const q = searchTerm.toLowerCase();
    return (
      loc.country.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.continent.toLowerCase().includes(q)
    );
  });

  // Recompute fixed position whenever dropdown opens or window resizes
  useEffect(() => {
    if (!searchOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onResize = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [searchOpen]);

  // Close on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // Allow clicks inside the fixed dropdown (identified by data attr)
        const dropEl = document.getElementById('search-dropdown-portal');
        if (dropEl && dropEl.contains(target)) return;
        setSearchOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  return (
    <>
      {/* ── BRAND: compact top-left pill ─────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-30 pointer-events-auto select-none font-sans">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-zinc-950/70 backdrop-blur-xl shadow-xl">
          {/* spinning globe icon */}
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.25)] shrink-0">
            <Globe className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="leading-none">
            <div className="text-[9px] tracking-widest text-sky-400 uppercase font-mono font-bold">
              ASTRA 2026
              <span className="ml-1.5 text-slate-500 font-normal">02 · 03 · 04</span>
            </div>
            <div className="text-[11px] font-semibold text-white tracking-wide mt-0.5">
              Coastal Flood &amp; NavIC Rescue
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTROLS: compact top-right group ────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-30 pointer-events-auto select-none font-sans flex items-center gap-2">

        {/* Quick picks (hidden on small screens) */}
        <div className="hidden xl:flex items-center gap-1 px-1.5 py-1.5 rounded-2xl bg-zinc-950/60 backdrop-blur-xl text-xs">
          {QUICK_PICKS.map((pick) => {
            const loc = GLOBAL_COASTAL_DATASET.find((l) => l.id === pick.id);
            if (!loc) return null;
            const isSelected = selectedLocation.id === loc.id;
            return (
              <button
                key={pick.id}
                onClick={() => onSelectLocation(loc)}
                className={`px-2 py-1 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-sky-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/8'
                }`}
              >
                <span>{loc.flag}</span>
                <span>{pick.country}</span>
              </button>
            );
          })}
        </div>

        {/* Live / dataset status pill */}
        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950/60 backdrop-blur-xl text-[10px] font-mono flex items-center gap-1.5 text-slate-400">
          {liveMarine.isLive ? (
            <>
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">LIVE</span>
              {liveMarine.waveHeightMeters !== null && (
                <span className="text-white">{liveMarine.waveHeightMeters}m swell</span>
              )}
            </>
          ) : (
            <>
              <Layers className="w-3 h-3 text-sky-400" />
              <span className="text-sky-300">100+ HUBS</span>
            </>
          )}
        </div>

        {/* Search button — the trigger */}
        <button
          ref={triggerRef}
          onClick={() => setSearchOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/70 backdrop-blur-xl border border-white/10 text-xs text-slate-200 hover:text-white hover:border-white/20 transition-all shadow-xl"
        >
          <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span>{selectedLocation.flag}</span>
            <span>{selectedLocation.country}</span>
            <span className="text-slate-400 font-normal hidden sm:inline truncate max-w-[100px]">
              ({selectedLocation.city.split(' (')[0]})
            </span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${searchOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── SEARCH DROPDOWN: rendered via fixed positioning to escape ALL overflow ───── */}
      {searchOpen && (
        <div
          id="search-dropdown-portal"
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
          className="w-80 max-h-[420px] bg-zinc-950 border border-white/15 rounded-2xl p-3 shadow-[0_8px_60px_rgba(0,0,0,0.9)] flex flex-col gap-2 font-sans"
        >
          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 100+ coastal cities or countries…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/60 transition-colors"
            />
          </div>

          {/* Results list */}
          <div className="overflow-y-auto space-y-0.5 pr-0.5" style={{ maxHeight: 340 }}>
            {filteredLocations.map((loc) => {
              const isSel = selectedLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    setSearchOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSel
                      ? 'bg-sky-500/20 text-sky-200'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{loc.flag}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{loc.city}</div>
                      <div className="text-[10px] text-slate-500">{loc.country} · {loc.continent}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums shrink-0 ml-2">
                    {loc.elevationMeters > 0 ? `+${loc.elevationMeters}m` : `${loc.elevationMeters}m`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
