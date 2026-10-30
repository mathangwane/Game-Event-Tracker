import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  initialDate?: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  initialDate,
  onSelectDate,
  onClose,
}) => {
  if (!isOpen) return null;

  const parseInitial = () => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      const [y, m, d] = initialDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const initialObj = parseInitial();
  const [viewYear, setViewYear] = useState(initialObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialObj.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate ||
      `${initialObj.getFullYear()}-${String(initialObj.getMonth() + 1).padStart(2, '0')}-${String(initialObj.getDate()).padStart(2, '0')}`
  );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build calendar grid days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({
      dateStr: `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    cells.push({
      dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full rows (multiple of 7)
  const remainingCells = 42 - cells.length;
  for (let d = 1; d <= remainingCells && cells.length < 42; d++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({
      dateStr: `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  const handleConfirm = () => {
    onSelectDate(selectedDate);
    onClose();
  };

  // Format selected date preview (e.g. "Fri, Oct 30, 2026")
  const selectedObj = (() => {
    if (!selectedDate) return new Date();
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  })();

  const formattedHeaderDate = selectedObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-sm rounded-[28px] bg-[#1E2024] border border-[#2F333A] text-slate-100 shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="m3-datepicker-title"
      >
        {/* Material 3 DatePicker Header */}
        <div className="bg-[#26282E] px-6 pt-5 pb-4 border-b border-[#343842]">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-slate-400">
            <span>Select Date</span>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div id="m3-datepicker-title" className="text-2xl font-bold tracking-tight text-white mt-1">
            {formattedHeaderDate}
          </div>
        </div>

        {/* Month Navigation & Controls */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous Month"
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next Month"
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map((day, idx) => (
              <span key={idx} className="text-xs font-medium text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.slice(0, 35).map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  type="button"
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`h-9 w-9 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30'
                      : isToday
                      ? 'border border-indigo-400 text-indigo-300 font-semibold'
                      : cell.isCurrentMonth
                      ? 'text-slate-200 hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dialog Actions (Material 3 standard: Cancel / OK buttons) */}
        <div className="px-6 py-4 bg-[#1E2024] border-t border-[#2F333A] flex items-center justify-end gap-3">
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
  );
};
