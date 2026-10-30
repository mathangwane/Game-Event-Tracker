import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { GameEvent, GameType } from '../types/event';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';

interface EventEntryDialogProps {
  isOpen: boolean;
  defaultDate?: string;
  onSave: (event: Omit<GameEvent, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const EventEntryDialog: React.FC<EventEntryDialogProps> = ({
  isOpen,
  defaultDate,
  onSave,
  onClose,
}) => {
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const [game, setGame] = useState<GameType | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<string>(defaultDate || todayStr);
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endTime, setEndTime] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{
    game?: string;
    title?: string;
    date?: string;
    time?: string;
  }>({});

  // Sub-modal pickers
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<'start' | 'end' | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: {
      game?: string;
      title?: string;
      date?: string;
      time?: string;
    } = {};

    if (!game) {
      newErrors.game = 'Game is required. Please choose Torn or Farm RPG.';
    }

    if (!title.trim()) {
      newErrors.title = 'Event title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Event title must be at least 3 characters.';
    }

    if (!date) {
      newErrors.date = 'Event date is required.';
    }

    if (startTime && endTime && startTime > endTime) {
      newErrors.time = 'Start time cannot be later than end time.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      game: game!,
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      description: description.trim() || undefined,
    });

    // Clear form
    setGame(null);
    setTitle('');
    setDate(todayStr);
    setStartTime(undefined);
    setEndTime(undefined);
    setDescription('');
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <div
          className="w-full max-w-lg my-8 rounded-[28px] bg-[#16181D] border border-[#2B303B] text-slate-100 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-dialog-title"
        >
          {/* Material 3 Modal Header */}
          <div className="px-6 py-5 bg-[#1C1F26] border-b border-[#2A2E39] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                New Event Entry
              </div>
              <h2 id="event-dialog-title" className="text-xl font-bold text-white mt-0.5">
                Add Game Event
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
            {/* Field 1: Game Selector Segmented Button Group */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Game Selector <span className="text-red-400">*</span>
              </label>
              
              <div
                role="group"
                aria-label="Select Game"
                className={`grid grid-cols-2 p-1.5 rounded-2xl bg-[#20242D] border transition-colors ${
                  errors.game ? 'border-red-500/80 bg-red-950/20' : 'border-[#2E3442]'
                }`}
              >
                {/* Torn Button (Crimson) */}
                <button
                  type="button"
                  onClick={() => {
                    setGame('Torn');
                    if (errors.game) setErrors((prev) => ({ ...prev, game: undefined }));
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    game === 'Torn'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${game === 'Torn' ? 'bg-white' : 'bg-red-500'}`} />
                  <span>Torn</span>
                </button>

                {/* Farm RPG Button (Emerald Green) */}
                <button
                  type="button"
                  onClick={() => {
                    setGame('Farm RPG');
                    if (errors.game) setErrors((prev) => ({ ...prev, game: undefined }));
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    game === 'Farm RPG'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${game === 'Farm RPG' ? 'bg-white' : 'bg-emerald-500'}`} />
                  <span>Farm RPG</span>
                </button>
              </div>

              {errors.game && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.game}</span>
                </div>
              )}
            </div>

            {/* Field 2: Event Title (Required) */}
            <div>
              <label htmlFor="event-title-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                id="event-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="e.g. Faction War Kickoff, Fishing Tournament..."
                className={`w-full px-4 py-3 rounded-xl bg-[#20242D] text-slate-100 placeholder-slate-500 text-sm border focus:outline-hidden transition-all ${
                  errors.title
                    ? 'border-red-500 focus:border-red-400 ring-2 ring-red-500/20'
                    : 'border-[#2E3442] focus:border-indigo-500 ring-1 ring-transparent focus:ring-indigo-500/20'
                }`}
              />
              {errors.title && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.title}</span>
                </div>
              )}
            </div>

            {/* Field 3: Event Date (Required, Material 3 DatePicker Trigger) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Event Date <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#20242D] border text-sm transition-all text-left ${
                  errors.date
                    ? 'border-red-500 text-red-300'
                    : 'border-[#2E3442] text-slate-200 hover:border-indigo-500/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium font-mono">
                    {date
                      ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Select Date'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-md">
                  Change
                </span>
              </button>
              {errors.date && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.date}</span>
                </div>
              )}
            </div>

            {/* Field 4: Start Time & End Time (Optional, Material 3 TimePicker Triggers) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Start Time <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTimePicker('start')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#2E3442] text-sm text-slate-300 hover:border-indigo-500/60 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400/80" />
                    <span className="font-mono text-xs font-medium">
                      {startTime || 'Not specified'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 hover:text-white">
                    {startTime ? 'Edit' : 'Pick'}
                  </span>
                </button>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  End Time <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTimePicker('end')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#2E3442] text-sm text-slate-300 hover:border-indigo-500/60 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400/80" />
                    <span className="font-mono text-xs font-medium">
                      {endTime || 'Not specified'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 hover:text-white">
                    {endTime ? 'Edit' : 'Pick'}
                  </span>
                </button>
              </div>
            </div>

            {errors.time && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.time}</span>
              </div>
            )}

            {/* Field 5: Description / Notes (Optional) */}
            <div>
              <label htmlFor="event-description-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description & Notes <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                id="event-description-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add faction instructions, harvest coordinates, loot goals, or alarm reminders..."
                className="w-full px-4 py-3 rounded-xl bg-[#20242D] border border-[#2E3442] text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#2A2E39]">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Event</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DatePicker Sub-Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        initialDate={date}
        onSelectDate={(newDate) => {
          setDate(newDate);
          if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
        }}
        onClose={() => setIsDatePickerOpen(false)}
      />

      {/* TimePicker Sub-Modal */}
      <TimePickerModal
        isOpen={activeTimePicker !== null}
        initialTime={activeTimePicker === 'start' ? startTime : endTime}
        title={activeTimePicker === 'start' ? 'Event Start Time' : 'Event End Time'}
        onSelectTime={(newTime) => {
          if (activeTimePicker === 'start') setStartTime(newTime);
          if (activeTimePicker === 'end') setEndTime(newTime);
          if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
        }}
        onClose={() => setActiveTimePicker(null)}
      />
    </>
  );
};
