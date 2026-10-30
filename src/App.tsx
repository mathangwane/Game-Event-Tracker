/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  Code2,
  Usb,
  Sparkles,
  Search,
  CheckCircle,
} from 'lucide-react';
import { GameEvent, GameType } from './types/event';
import { loadStoredEvents, saveStoredEvents, resetToSeedData } from './data/storage';
import { CalendarView } from './components/CalendarView';
import { AgendaListView } from './components/AgendaListView';
import { GameLegendAndFilters } from './components/GameLegendAndFilters';
import { EventEntryDialog } from './components/EventEntryDialog';
import { EventDetailModal } from './components/EventDetailModal';
import { AndroidCodeInspector } from './components/AndroidCodeInspector';
import { AdbInstallModal } from './components/AdbInstallModal';
import { PWAInstallButton } from './components/PWAInstallButton';

export default function App() {
  // Events state with local persistence
  const [events, setEvents] = useState<GameEvent[]>(() => loadStoredEvents());

  // Filters state (both enabled by default per requirements)
  const [showTorn, setShowTorn] = useState(true);
  const [showFarmRpg, setShowFarmRpg] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active view tab: 'calendar' | 'agenda' | 'android-source'
  const [activeTab, setActiveTab] = useState<'calendar' | 'agenda' | 'android-source'>('calendar');

  // Device frame simulation: 'phone' | 'tablet' | 'responsive'
  const [deviceFrame, setDeviceFrame] = useState<'phone' | 'tablet' | 'responsive'>('responsive');

  // Calendar date navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Modal dialog states
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string | undefined>(undefined);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<GameEvent | null>(null);
  const [isAdbModalOpen, setIsAdbModalOpen] = useState(false);

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync state to local persistence whenever events change
  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  // Handlers for month navigation
  const handleChangeMonth = (delta: number) => {
    setCurrentCalendarDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  const handleGoToToday = () => {
    setCurrentCalendarDate(new Date());
  };

  // Add new event
  const handleSaveEvent = (eventData: Omit<GameEvent, 'id' | 'createdAt'>) => {
    const newEvent: GameEvent = {
      ...eventData,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    showToast(`Saved ${newEvent.game} event: "${newEvent.title}"`);
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    showToast('Event removed from storage.');
  };

  // Reset to seed data
  const handleResetData = () => {
    if (window.confirm('Reset all events to the sample seeds for Torn and Farm RPG?')) {
      const seeds = resetToSeedData();
      setEvents(seeds);
      showToast('Database reset to sample events.');
    }
  };

  // Filter events by game and search query
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (ev.game === 'Torn' && !showTorn) return false;
      if (ev.game === 'Farm RPG' && !showFarmRpg) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [events, showTorn, showFarmRpg, searchQuery]);

  // Count by game
  const tornCount = useMemo(() => events.filter((e) => e.game === 'Torn').length, [events]);
  const farmRpgCount = useMemo(() => events.filter((e) => e.game === 'Farm RPG').length, [events]);

  return (
    <div className="min-h-screen bg-[#0C0D11] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-5 Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 md:px-8 py-3.5 bg-[#12141A]/95 backdrop-blur-md border-b border-[#222632]">
        {/* Zone 1: Single Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-indigo-600 to-emerald-600 p-0.5 shadow-md shadow-indigo-600/20">
            <div className="w-full h-full bg-[#12141A] rounded-[10px] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Game Event Tracker
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'calendar' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'text-slate-400'
            }`}
          >
            Monthly Calendar
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'agenda' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'text-slate-400'
            }`}
          >
            Agenda Timeline
          </button>
          <button
            onClick={() => setActiveTab('android-source')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'android-source' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'text-slate-400'
            }`}
          >
            Jetpack Compose Code
          </button>
          <button
            onClick={() => setIsAdbModalOpen(true)}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-emerald-400 text-slate-400"
          >
            <Usb className="w-3.5 h-3.5 text-emerald-400" />
            <span>USB / ADB Install</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <PWAInstallButton />
          <button
            type="button"
            onClick={() => {
              setSelectedDateForNewEvent(undefined);
              setIsEntryDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </header>

      {/* Secondary Utility Toolbar */}
      <section className="bg-[#15171F] border-b border-[#20242F] px-4 md:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden items-center p-1 rounded-xl bg-[#1C1F28] border border-[#2B303C]">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'agenda' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setActiveTab('android-source')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'android-source' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Code
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Torn or Farm RPG events..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1D212B] border border-[#2B303D] text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Device Adaptive Preview Mode Selector */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-[#1C1F28] border border-[#2B303C]">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Preview:</span>
            <button
              type="button"
              onClick={() => setDeviceFrame('phone')}
              title="Pixel 8 Phone View"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceFrame === 'phone'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceFrame('tablet')}
              title="Pixel Tablet View"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceFrame === 'tablet'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceFrame('responsive')}
              title="Full Responsive View"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceFrame === 'responsive'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Seed Data Reset Action */}
          <button
            type="button"
            onClick={handleResetData}
            title="Reset database to default sample events"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#1E222D] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Samples</span>
          </button>
        </div>
      </section>

      {/* Main Content Viewport Canvas */}
      <main className="flex-1 p-4 md:p-8 flex justify-center items-start">
        <div
          className={`w-full transition-all duration-300 ${
            deviceFrame === 'phone'
              ? 'max-w-[430px] rounded-[40px] border-8 border-[#252834] shadow-2xl p-4 bg-[#101217]'
              : deviceFrame === 'tablet'
              ? 'max-w-4xl rounded-[32px] border-8 border-[#252834] shadow-2xl p-6 bg-[#101217]'
              : 'max-w-6xl'
          }`}
        >
          {/* Legend and Filter Controls */}
          <div className="mb-6">
            <GameLegendAndFilters
              showTorn={showTorn}
              showFarmRpg={showFarmRpg}
              tornCount={tornCount}
              farmRpgCount={farmRpgCount}
              onToggleTorn={() => setShowTorn((v) => !v)}
              onToggleFarmRpg={() => setShowFarmRpg((v) => !v)}
            />
          </div>

          {/* Active View: Calendar | Agenda | Android Source */}
          {activeTab === 'calendar' && (
            <CalendarView
              events={filteredEvents}
              currentDate={currentCalendarDate}
              onChangeMonth={handleChangeMonth}
              onGoToToday={handleGoToToday}
              onSelectEvent={(event) => setSelectedEventForDetail(event)}
              onSelectDateToCreate={(dateStr) => {
                setSelectedDateForNewEvent(dateStr);
                setIsEntryDialogOpen(true);
              }}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaListView
              events={filteredEvents}
              onSelectEvent={(event) => setSelectedEventForDetail(event)}
              onOpenCreate={() => {
                setSelectedDateForNewEvent(undefined);
                setIsEntryDialogOpen(true);
              }}
            />
          )}

          {activeTab === 'android-source' && <AndroidCodeInspector />}
        </div>
      </main>

      {/* Floating Action Button (FAB) - Material 3 Gaming Experience */}
      <aside aria-label="Quick Actions" className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setSelectedDateForNewEvent(undefined);
            setIsEntryDialogOpen(true);
          }}
          className="h-14 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-2xl shadow-indigo-600/50 flex items-center gap-3 transition-all font-bold text-sm border border-indigo-400/30"
          aria-label="Add New Event"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
          <span className="hidden sm:inline">New Event</span>
        </button>
      </aside>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#1E222D] border border-indigo-500/50 shadow-2xl text-xs font-semibold text-white flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Dialogs */}
      <EventEntryDialog
        isOpen={isEntryDialogOpen}
        defaultDate={selectedDateForNewEvent}
        onSave={handleSaveEvent}
        onClose={() => {
          setIsEntryDialogOpen(false);
          setSelectedDateForNewEvent(undefined);
        }}
      />

      <EventDetailModal
        event={selectedEventForDetail}
        isOpen={selectedEventForDetail !== null}
        onDelete={handleDeleteEvent}
        onClose={() => setSelectedEventForDetail(null)}
      />

      <AdbInstallModal
        isOpen={isAdbModalOpen}
        onClose={() => setIsAdbModalOpen(false)}
      />
    </div>
  );
}
