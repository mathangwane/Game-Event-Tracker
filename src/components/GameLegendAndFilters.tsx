import React from 'react';
import { Check, Eye, EyeOff, Filter } from 'lucide-react';

interface GameLegendAndFiltersProps {
  showTorn: boolean;
  showFarmRpg: boolean;
  tornCount: number;
  farmRpgCount: number;
  onToggleTorn: () => void;
  onToggleFarmRpg: () => void;
}

export const GameLegendAndFilters: React.FC<GameLegendAndFiltersProps> = ({
  showTorn,
  showFarmRpg,
  tornCount,
  farmRpgCount,
  onToggleTorn,
  onToggleFarmRpg,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#16181D] border border-[#262A34]">
      {/* Legend Area */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filters & Legend:</span>
        </span>

        {/* Torn Legend Badge */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 shadow-sm shadow-red-500/50" />
          <span className="font-semibold text-slate-300">Torn</span>
          <span className="text-[11px] text-red-400 font-mono">({tornCount})</span>
        </div>

        {/* Farm RPG Legend Badge */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="font-semibold text-slate-300">Farm RPG</span>
          <span className="text-[11px] text-emerald-400 font-mono">({farmRpgCount})</span>
        </div>
      </div>

      {/* Interactive Filter Chips / Switches */}
      <div className="flex items-center gap-2">
        {/* Toggle Torn Chip */}
        <button
          type="button"
          onClick={onToggleTorn}
          aria-pressed={showTorn}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            showTorn
              ? 'bg-red-950/60 text-red-200 border border-red-700/60 shadow-xs'
              : 'bg-[#20232B] text-slate-500 border border-[#2B303B] hover:text-slate-400 opacity-60'
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              showTorn ? 'bg-red-600 text-white' : 'bg-[#2D323E] text-transparent'
            }`}
          >
            {showTorn ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <EyeOff className="w-2.5 h-2.5" />}
          </span>
          <span>Show Torn</span>
        </button>

        {/* Toggle Farm RPG Chip */}
        <button
          type="button"
          onClick={onToggleFarmRpg}
          aria-pressed={showFarmRpg}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            showFarmRpg
              ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-700/60 shadow-xs'
              : 'bg-[#20232B] text-slate-500 border border-[#2B303B] hover:text-slate-400 opacity-60'
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              showFarmRpg ? 'bg-emerald-600 text-white' : 'bg-[#2D323E] text-transparent'
            }`}
          >
            {showFarmRpg ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <EyeOff className="w-2.5 h-2.5" />}
          </span>
          <span>Show Farm RPG</span>
        </button>
      </div>
    </div>
  );
};
