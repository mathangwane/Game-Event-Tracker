import { GameEvent } from '../types/event';

const STORAGE_KEY = 'game_event_tracker_events_v1';

// Generate dynamic dates anchored around current date for immediate visibility
function formatOffsetDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const SEED_EVENTS: GameEvent[] = [
  // Torn Events (Crimson Theme)
  {
    id: 'seed-torn-1',
    game: 'Torn',
    title: 'Elimination Tournament - Round 1',
    date: formatOffsetDate(-3),
    startTime: '12:00',
    endTime: '18:00',
    description: 'Annual elimination brawl tournament. Factions clash in team survival brackets. Ensure maximum medical supplies are stocked.',
    createdAt: Date.now() - 300000,
  },
  {
    id: 'seed-torn-2',
    game: 'Torn',
    title: 'Halloween Trick or Treat Kickoff',
    date: formatOffsetDate(0), // Today
    startTime: '00:00',
    endTime: '23:59',
    description: 'Citywide Halloween basket upgrades, creepy encounters, and candy trading madness across all districts.',
    createdAt: Date.now() - 200000,
  },
  {
    id: 'seed-torn-3',
    game: 'Torn',
    title: 'Dog Tags Bounty Hunt',
    date: formatOffsetDate(4),
    startTime: '15:00',
    endTime: '21:00',
    description: 'Hunt down rivals to steal their personalized dog tags. High value exchange rewards in the casino exchange.',
    createdAt: Date.now() - 150000,
  },
  {
    id: 'seed-torn-4',
    game: 'Torn',
    title: 'Crime Spree Double Respect',
    date: formatOffsetDate(9),
    startTime: '08:00',
    endTime: '20:00',
    description: 'Organized crime rewards and faction respect gain boosted by 2x for all successful robberies.',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'seed-torn-5',
    game: 'Torn',
    title: 'Dirty Bomb Testing Operation',
    date: formatOffsetDate(15),
    startTime: '17:00',
    endTime: '22:00',
    description: 'Classified faction offensive exercise against rival territory defense nodes.',
    createdAt: Date.now() - 50000,
  },

  // Farm RPG Events (Green Theme)
  {
    id: 'seed-farm-1',
    game: 'Farm RPG',
    title: 'Bountiful Harvest Expo',
    date: formatOffsetDate(-5),
    startTime: '06:00',
    endTime: '20:00',
    description: 'Crop yields boosted by 50% across all farm plots. Special gold carrots and giant pumpkins available in the market.',
    createdAt: Date.now() - 400000,
  },
  {
    id: 'seed-farm-2',
    game: 'Farm RPG',
    title: 'Community Sprout Festival',
    date: formatOffsetDate(0), // Today
    startTime: '09:00',
    endTime: '19:00',
    description: 'Cooperative community goal event: plant 10,000,000 crops collectively to unlock universal stamina refreshments.',
    createdAt: Date.now() - 250000,
  },
  {
    id: 'seed-farm-3',
    game: 'Farm RPG',
    title: 'Tower Rush Weekend',
    date: formatOffsetDate(2),
    startTime: '10:00',
    endTime: '23:00',
    description: 'Climb the 250-level Farm RPG dungeon tower with 25% reduced silver unlock costs and artifact drops.',
    createdAt: Date.now() - 180000,
  },
  {
    id: 'seed-farm-4',
    game: 'Farm RPG',
    title: 'Whispering Creek Fishing Derby',
    date: formatOffsetDate(7),
    startTime: '07:30',
    endTime: '16:00',
    description: 'Grab your mealworms and large nets! Rare Golden Sea Bass and Legendary Catfish biting rates increased 3x.',
    createdAt: Date.now() - 120000,
  },
  {
    id: 'seed-farm-5',
    game: 'Farm RPG',
    title: 'Mushroom Foraging Expedition',
    date: formatOffsetDate(12),
    startTime: '11:00',
    endTime: '15:30',
    description: 'Forest explorations yield double rare truffles and chanterelles needed for grand cooking recipes.',
    createdAt: Date.now() - 80000,
  },
];

export function loadStoredEvents(): GameEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First launch - seed initial sample events
      saveStoredEvents(SEED_EVENTS);
      return SEED_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveStoredEvents(SEED_EVENTS);
      return SEED_EVENTS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load events from storage, returning seeds:', err);
    return SEED_EVENTS;
  }
}

export function saveStoredEvents(events: GameEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to storage:', err);
  }
}

export function resetToSeedData(): GameEvent[] {
  saveStoredEvents(SEED_EVENTS);
  return SEED_EVENTS;
}
