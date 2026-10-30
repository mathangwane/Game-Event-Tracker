import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Flame,
  Sprout,
  MoreHorizontal,
} from 'lucide-react';
import { GameEvent, CalendarDay } from '../types/event';

interface CalendarViewProps {
  events: GameEvent[];
  currentDate: Date;
  onChangeMonth: (delta: number) => void;
  onGoToToday: () => void;
  onSelectEvent: (event: GameEvent) => void;
  onSelectDateToCreate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  currentDate,
  onChangeMonth,
  onGoToToday,
  onSelectEvent,
  onSelectDateToCreate,
}) => {
  const [selectedDayPopover, setSelectedDayPopover] = useState<{
    dateStr: string;
    events: GameEvent[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper for today's date string
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Build calendar matrix
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Map events by dateString
  const eventsByDate = new Map<string, GameEvent[]>();
  events.forEach((ev) => {
    const list = eventsByDate.get(ev.date) || [];
    list.push(ev);
    eventsByDate.set(ev.date, list);
  });

  const calendarDays: CalendarDay[] = [];

  // Trailing days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      dateString: dateStr,
      dayNumber: dayNum,
      month: prevMonthIdx,
      year: prevYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: eventsByDate.get(dateStr) || [],
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dateString: dateStr,
      dayNumber: d,
      month,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: eventsByDate.get(dateStr) || [],
    });
  }

  // Leading days of next month to complete 5 or 6 weeks (multiples of 7)
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  const targetTotal = calendarDays.length + remaining < 35 ? 35 : calendarDays.length + remaining;
  const neededTrailing = targetTotal - calendarDays.length;

  for (let d = 1; d <= neededTrailing; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dateString: dateStr,
      dayNumber: d,
      month: nextMonthIdx,
      year: nextYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: eventsByDate.get(dateStr) || [],
    });
  }

  return (
    <div className="flex flex-col bg-[#14161C] rounded-[24px] border border-[#232732] shadow-xl overflow-hidden">
      {/* Calendar Top Navigation Bar */}
      <div className="px-5 py-4 bg-[#191C24] border-b border-[#262B38] flex flex-wrap items-center justify-between gap-3">
        {/* Month & Year Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              {MONTH_NAMES[month]} <span className="text-slate-400 font-mono">{year}</span>
            </h2>
            <div className="text-xs text-slate-400">
              {events.length} event{events.length === 1 ? '' : 's'} scheduled
            </div>
          </div>
        </div>

        {/* Navigation Controls: Previous Month, Today, Next Month */}
        <div className="flex items-center gap-2">
          {/* Previous Month */}
          <button
            type="button"
            onClick={() => onChangeMonth(-1)}
            aria-label="Previous Month"
            className="p-2 rounded-xl bg-[#20242E] text-slate-300 hover:text-white hover:bg-[#2A303D] active:scale-95 transition-all border border-[#2B303B]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Today Button */}
          <button
            type="button"
            onClick={onGoToToday}
            className="px-3.5 py-1.5 rounded-xl bg-[#20242E] text-slate-200 hover:text-white hover:bg-[#2A303D] text-xs font-bold active:scale-95 transition-all border border-[#2B303B]"
          >
            Today
          </button>

          {/* Next Month */}
          <button
            type="button"
            onClick={() => onChangeMonth(1)}
            aria-label="Next Month"
            className="p-2 rounded-xl bg-[#20242E] text-slate-300 hover:text-white hover:bg-[#2A303D] active:scale-95 transition-all border border-[#2B303B]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 bg-[#171920] border-b border-[#232732] text-center">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={`py-2.5 text-xs font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 auto-rows-fr gap-px bg-[#20232C]">
        {calendarDays.map((day) => {
          const maxVisibleEvents = 2; // On mobile/tablet, show up to 2 and then "+N more"
          const visibleEvents = day.events.slice(0, maxVisibleEvents);
          const hiddenCount = day.events.length - visibleEvents.length;

          return (
            <div
              key={day.dateString}
              onClick={() => onSelectDateToCreate(day.dateString)}
              className={`min-h-[95px] md:min-h-[120px] p-1.5 md:p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                day.isCurrentMonth
                  ? 'bg-[#14161C] hover:bg-[#181B23]'
                  : 'bg-[#101217] text-slate-600 hover:bg-[#13161D]'
              }`}
            >
              {/* Day Cell Header: Number + Today indicator */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-transform ${
                    day.isToday
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400/30'
                      : day.isCurrentMonth
                      ? 'text-slate-300 group-hover:text-white'
                      : 'text-slate-600'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Quick Add indicator on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDateToCreate(day.dateString);
                  }}
                  title="Add event on this date"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-opacity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Event Badges List (Compact, Color Coded) */}
              <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                {visibleEvents.map((ev) => {
                  const isTorn = ev.game === 'Torn';
                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className={`px-1.5 py-1 rounded-md text-left transition-all hover:scale-[1.02] active:scale-98 shadow-xs border ${
                        isTorn
                          ? 'bg-red-950/70 text-red-200 border-red-800/60 hover:bg-red-900/80 hover:border-red-600'
                          : 'bg-emerald-950/70 text-emerald-200 border-emerald-800/60 hover:bg-emerald-900/80 hover:border-emerald-600'
                      }`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isTorn ? 'bg-red-500' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-[11px] font-semibold truncate leading-tight flex-1">
                          {ev.title}
                        </span>
                      </div>
                      {ev.startTime && (
                        <div className="text-[9px] font-mono opacity-80 pl-2.5 truncate">
                          {ev.startTime}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* "+N more" indicator if day has multiple events */}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDayPopover({
                        dateStr: day.dateString,
                        events: day.events,
                      });
                    }}
                    className="mt-auto px-1.5 py-0.5 rounded-md bg-[#222631] hover:bg-[#2B303E] text-slate-300 hover:text-white text-[10px] font-bold text-left transition-colors flex items-center justify-between"
                  >
                    <span>+{hiddenCount} more</span>
                    <MoreHorizontal className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popover / Sheet for "+N more" Day View */}
      {selectedDayPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[24px] bg-[#181B22] border border-[#2B303B] shadow-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#262B36] pb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  All Events For
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {new Date(selectedDayPopover.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedDayPopover(null)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {selectedDayPopover.events.map((ev) => {
                const isTorn = ev.game === 'Torn';
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedDayPopover(null);
                      onSelectEvent(ev);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                      isTorn
                        ? 'bg-red-950/60 border-red-800/60 text-red-100 hover:bg-red-900/80'
                        : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-100 hover:bg-emerald-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isTorn ? 'bg-red-700 text-white' : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {ev.game}
                      </span>
                      {ev.startTime && (
                        <span className="text-[11px] font-mono text-slate-300">
                          {ev.startTime}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white mt-1.5">{ev.title}</div>
                    {ev.description && (
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {ev.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const d = selectedDayPopover.dateStr;
                setSelectedDayPopover(null);
                onSelectDateToCreate(d);
              }}
              className="mt-2 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event for this Day</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
