import React, { useState } from 'react';
import { X, Calendar, Clock, Trash2, AlertTriangle, ShieldCheck, Gamepad2, FileText } from 'lucide-react';
import { GameEvent } from '../types/event';

interface EventDetailModalProps {
  event: GameEvent | null;
  isOpen: boolean;
  onDelete: (eventId: string) => void;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onDelete,
  onClose,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen || !event) return null;

  const isTorn = event.game === 'Torn';

  // Compute status relative to today
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const isPast = event.date < todayStr;
  const isToday = event.date === todayStr;
  const isUpcoming = event.date > todayStr;

  const formattedDate = new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    onDelete(event.id);
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-[28px] bg-[#17191F] border border-[#2B303B] text-slate-100 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        {/* Color-Coded Header Banner */}
        <div
          className={`px-6 py-5 border-b flex items-start justify-between ${
            isTorn
              ? 'bg-gradient-to-r from-red-950/80 via-red-900/50 to-[#17191F] border-red-800/40'
              : 'bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-[#17191F] border-emerald-800/40'
          }`}
        >
          <div className="flex flex-col gap-1.5 pr-4">
            {/* Game Badge & Timing Status */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isTorn
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/40'
                    : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {event.game}
              </span>

              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                  isToday
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : isPast
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-indigo-950/50 text-indigo-300 border border-indigo-800/30'
                }`}
              >
                {isToday ? 'Happening Today' : isPast ? 'Past Event' : 'Upcoming'}
              </span>
            </div>

            <h2 id="detail-title" className="text-xl font-bold text-white tracking-tight mt-1">
              {event.title}
            </h2>
          </div>

          <button
            onClick={() => {
              setIsConfirmingDelete(false);
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Details */}
        <div className="p-6 flex flex-col gap-4">
          {/* Date Row */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#1F232B] border border-[#2D333E]">
            <div className="p-2.5 rounded-xl bg-[#282D37] text-indigo-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Scheduled Date
              </div>
              <div className="text-sm font-semibold text-slate-100 font-mono mt-0.5">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Time Row */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#1F232B] border border-[#2D333E]">
            <div className="p-2.5 rounded-xl bg-[#282D37] text-indigo-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Time Window
              </div>
              <div className="text-sm font-semibold text-slate-100 font-mono mt-0.5">
                {event.startTime || event.endTime ? (
                  <span>
                    {event.startTime ? event.startTime : 'Start unspecified'}
                    {' — '}
                    {event.endTime ? event.endTime : 'End unspecified'}
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">All-day / flexible event</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes / Description */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#1F232B] border border-[#2D333E]">
            <div className="p-2.5 rounded-xl bg-[#282D37] text-indigo-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Notes & Instructions
              </div>
              <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                {event.description || (
                  <span className="italic text-slate-500">No additional notes provided.</span>
                )}
              </p>
            </div>
          </div>

          {/* Delete Confirmation Warning (if active) */}
          {isConfirmingDelete && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 flex flex-col gap-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-red-300 text-sm font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Delete this event?</span>
              </div>
              <p className="text-xs text-red-200/80">
                This action permanently removes "{event.title}" from your device storage.
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm shadow-red-600/30"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 bg-[#14161B] border-t border-[#252831] flex items-center justify-between">
          {!isConfirmingDelete ? (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Event</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => {
              setIsConfirmingDelete(false);
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-[#2A2E38] hover:bg-[#353A47] rounded-full transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
