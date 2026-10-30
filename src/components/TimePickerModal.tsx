import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';

interface TimePickerModalProps {
  isOpen: boolean;
  initialTime?: string; // "HH:mm" (24h)
  title?: string;
  onSelectTime: (time: string | undefined) => void;
  onClose: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  initialTime,
  title = 'Select Time',
  onSelectTime,
  onClose,
}) => {
  if (!isOpen) return null;

  // Parse initial 24h time to 12h + am/pm or keep 24h
  const parseTime = () => {
    if (initialTime && /^\d{1,2}:\d{2}$/.test(initialTime)) {
      const [h, m] = initialTime.split(':').map(Number);
      const isPm = h >= 12;
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return {
        hour: h12,
        minute: m,
        period: isPm ? ('PM' as const) : ('AM' as const),
      };
    }
    return { hour: 12, minute: 0, period: 'PM' as const };
  };

  const parsed = parseTime();
  const [selectedHour, setSelectedHour] = useState<number>(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(parsed.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period);
  const [activeSegment, setActiveSegment] = useState<'hour' | 'minute'>('hour');

  const handleConfirm = () => {
    let h24 = selectedHour;
    if (period === 'PM' && h24 < 12) h24 += 12;
    if (period === 'AM' && h24 === 12) h24 = 0;

    const formatted = `${String(h24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onSelectTime(formatted);
    onClose();
  };

  const handleClear = () => {
    onSelectTime(undefined);
    onClose();
  };

  // Quick minute presets
  const minutePresets = [0, 15, 30, 45];
  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-sm rounded-[28px] bg-[#1E2024] border border-[#2F333A] text-slate-100 shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#26282E] px-6 py-4 border-b border-[#343842] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Material 3 Time Input Displays */}
        <div className="p-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Hour Block */}
            <button
              type="button"
              onClick={() => setActiveSegment('hour')}
              className={`w-20 h-18 rounded-2xl flex items-center justify-center text-3xl font-bold font-mono transition-all ${
                activeSegment === 'hour'
                  ? 'bg-indigo-600/30 text-indigo-400 border-2 border-indigo-500'
                  : 'bg-[#292D34] text-slate-200 border border-[#3C414C]'
              }`}
            >
              {String(selectedHour).padStart(2, '0')}
            </button>

            <span className="text-3xl font-bold text-slate-400 font-mono">:</span>

            {/* Minute Block */}
            <button
              type="button"
              onClick={() => setActiveSegment('minute')}
              className={`w-20 h-18 rounded-2xl flex items-center justify-center text-3xl font-bold font-mono transition-all ${
                activeSegment === 'minute'
                  ? 'bg-indigo-600/30 text-indigo-400 border-2 border-indigo-500'
                  : 'bg-[#292D34] text-slate-200 border border-[#3C414C]'
              }`}
            >
              {String(selectedMinute).padStart(2, '0')}
            </button>

            {/* AM / PM Segmented Switch */}
            <div className="flex flex-col rounded-xl overflow-hidden border border-[#3C414C] bg-[#292D34] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPeriod('AM')}
                className={`px-3 py-2 transition-colors ${
                  period === 'AM'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod('PM')}
                className={`px-3 py-2 transition-colors border-t border-[#3C414C] ${
                  period === 'PM'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick Selection Grid depending on Active Segment */}
          {activeSegment === 'hour' ? (
            <div className="w-full">
              <p className="text-xs font-semibold text-slate-400 mb-2 text-center uppercase tracking-wider">
                Select Hour
              </p>
              <div className="grid grid-cols-4 gap-2">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setSelectedHour(h);
                      setActiveSegment('minute'); // smooth transition to minute
                    }}
                    className={`py-2 rounded-xl text-sm font-semibold font-mono transition-all ${
                      selectedHour === h
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[#292D34] text-slate-300 hover:bg-[#343943]'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <p className="text-xs font-semibold text-slate-400 mb-2 text-center uppercase tracking-wider">
                Select Minute
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {minutePresets.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMinute(m)}
                    className={`py-2 rounded-xl text-sm font-semibold font-mono transition-all ${
                      selectedMinute === m
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[#292D34] text-slate-300 hover:bg-[#343943]'
                    }`}
                  >
                    :{String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
              {/* Stepper for custom minute */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#26282E] rounded-xl border border-[#343842]">
                <button
                  type="button"
                  onClick={() => setSelectedMinute((m) => (m <= 0 ? 59 : m - 1))}
                  className="px-3 py-1 bg-[#323640] text-slate-200 rounded-lg hover:bg-slate-700 text-sm font-bold"
                >
                  -1m
                </button>
                <span className="text-sm font-mono font-medium text-slate-300">
                  Custom: {String(selectedMinute).padStart(2, '0')}m
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMinute((m) => (m >= 59 ? 0 : m + 1))}
                  className="px-3 py-1 bg-[#323640] text-slate-200 rounded-lg hover:bg-slate-700 text-sm font-bold"
                >
                  +1m
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="px-6 py-4 bg-[#1E2024] border-t border-[#2F333A] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline"
          >
            Clear Time
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-sm active:scale-95 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
