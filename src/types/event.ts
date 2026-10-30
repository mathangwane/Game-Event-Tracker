export type GameType = 'Torn' | 'Farm RPG';

export interface GameEvent {
  id: string;
  game: GameType;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm format (24-hour)
  endTime?: string; // HH:mm format (24-hour)
  description?: string;
  createdAt: number;
}

export interface CalendarDay {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  month: number; // 0-11
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: GameEvent[];
}
