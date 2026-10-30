import React from 'react';
import { Calendar, Clock, ChevronRight, Gamepad2, ShieldAlert } from 'lucide-react';
import { GameEvent } from '../types/event';

interface AgendaListViewProps {
  events: GameEvent[];
  onSelectEvent: (event: GameEvent) => void;
  onOpenCreate: () => void;
}

export const AgendaListView: React.FC<AgendaListViewProps> = ({
  events,
  onSelectEvent,
  onOpenCreate,
}) => {
  // Sort events chronologically
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  if (sorted.length === 0) {
    return (
      <div className="p-8 text-center rounded-[24px] bg-[#14161C] border border-[#232732] flex flex-col items-center justify-center gap-3">
        <Gamepad2 className="w-10 h-10 text-slate-600" />
        <h3 className="text-base font-bold text-slate-300">No events match current filter</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Try enabling both game filter chips ("Show Torn" and "Show Farm RPG") or create a new event.
        </p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
        >
          Add New Event
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((ev) => {
        const isTorn = ev.game === 'Torn';
        const isToday = ev.date === todayStr;
        const isPast = ev.date < todayStr;

        const dateObj = new Date(ev.date + 'T00:00:00');
        const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const dayNumber = dateObj.getDate();
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

        return (
          <div
            key={ev.id}
            onClick={() => onSelectEvent(ev)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 hover:scale-[1.008] active:scale-[0.99] ${
              isTorn
                ? 'bg-[#181214] border-red-900/40 hover:border-red-600/70'
                : 'bg-[#111714] border-emerald-900/40 hover:border-emerald-600/70'
            }`}
          >
            {/* Left Date Block */}
            <div
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                isToday
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                  : 'bg-[#1C2029] border-[#2E3340] text-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                {monthShort}
              </span>
              <span className="text-lg font-bold font-mono leading-tight">{dayNumber}</span>
              <span className="text-[9px] text-slate-400 leading-none">{weekday}</span>
            </div>

            {/* Middle Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isTorn ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {ev.game}
                </span>

                {isToday && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">
                    Today
                  </span>
                )}
                {isPast && (
                  <span className="text-[10px] text-slate-500">Past</span>
                )}
              </div>

              <h4 className="text-sm md:text-base font-bold text-white truncate mt-1">
                {ev.title}
              </h4>

              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                {(ev.startTime || ev.endTime) && (
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {ev.startTime || '—'} - {ev.endTime || '—'}
                    </span>
                  </div>
                )}
                {ev.description && (
                  <span className="truncate text-slate-400 text-xs hidden sm:inline">
                    · {ev.description}
                  </span>
                )}
              </div>
            </div>

            {/* Right Chevron */}
            <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
          </div>
        );
      })}
    </div>
  );
};
