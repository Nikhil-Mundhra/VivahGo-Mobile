import { DEFAULT_EVENTS, DEFAULT_TASKS, DEFAULT_VENDORS } from './data';

export const EMPTY_WEDDING = {
  bride: '',
  groom: '',
  date: '',
  venue: '',
  guests: '',
  budget: '',
};

const SAMPLE_GUESTS = [
  { id: 1, name: 'Rajesh Sharma', side: 'bride', phone: '+91 98765 43210', rsvp: 'yes' },
  { id: 2, name: 'Priya Mehta', side: 'bride', phone: '+91 98765 12345', rsvp: 'yes' },
  { id: 3, name: 'Vikram Singh', side: 'groom', phone: '+91 99887 56123', rsvp: 'pending' },
  { id: 4, name: 'Sunita Verma', side: 'groom', phone: '+91 91234 56789', rsvp: 'no' },
  { id: 5, name: 'Arjun Kapoor', side: 'bride', phone: '+91 87654 32109', rsvp: 'pending' },
];

const SAMPLE_EXPENSES = [
  { id: 1, name: 'Venue advance', amount: 200000, category: 'venue', note: '50% advance' },
  { id: 2, name: 'Bridal lehenga', amount: 150000, category: 'attire', note: 'Sabyasachi' },
  { id: 3, name: 'Caterer booking', amount: 85000, category: 'catering', note: 'South + North menu tasting' },
];

function cloneCollection(items) {
  return items.map(item => ({ ...item }));
}

function createDemoEvents() {
  return cloneCollection(DEFAULT_EVENTS).map((event, index) => ({
    ...event,
    date: ['12 Feb 2027', '13 Feb 2027', '13 Feb 2027', '14 Feb 2027', '14 Feb 2027', '15 Feb 2027'][index] || '',
    time: ['11:00 AM', '4:00 PM', '8:00 PM', '5:00 PM', '9:30 PM', '7:30 PM'][index] || '',
    venue: ['Jaipur Courtyard', 'Terrace Lawn', 'Royal Ballroom', 'Palace Entrance', 'Lotus Mandap', 'Sunset Pavilion'][index] || '',
    status: index < 2 ? 'confirmed' : 'upcoming',
    note: index === 4 ? 'Mandap setup by 7 PM' : '',
  }));
}

export function createBlankPlanner() {
  return {
    wedding: { ...EMPTY_WEDDING },
    events: [],
    expenses: [],
    guests: [],
    vendors: [],
    tasks: [],
  };
}

export function createDemoPlanner() {
  return {
    wedding: {
      bride: 'Aarohi',
      groom: 'Kabir',
      date: '14 February 2027',
      venue: 'Jaipur Palace Grounds',
      guests: '320',
      budget: '6500000',
    },
    events: createDemoEvents(),
    expenses: cloneCollection(SAMPLE_EXPENSES),
    guests: cloneCollection(SAMPLE_GUESTS),
    vendors: cloneCollection(DEFAULT_VENDORS),
    tasks: cloneCollection(DEFAULT_TASKS),
  };
}

export function normalizePlanner(planner) {
  const blankPlanner = createBlankPlanner();

  if (!planner || typeof planner !== 'object') {
    return blankPlanner;
  }

  return {
    wedding: { ...EMPTY_WEDDING, ...(planner.wedding || {}) },
    events: Array.isArray(planner.events) ? planner.events : blankPlanner.events,
    expenses: Array.isArray(planner.expenses) ? planner.expenses : blankPlanner.expenses,
    guests: Array.isArray(planner.guests) ? planner.guests : blankPlanner.guests,
    vendors: Array.isArray(planner.vendors) ? planner.vendors : blankPlanner.vendors,
    tasks: Array.isArray(planner.tasks) ? planner.tasks : blankPlanner.tasks,
  };
}

export function hasWeddingProfile(wedding) {
  return Boolean(
    wedding && (wedding.bride || wedding.groom || wedding.date || wedding.venue || wedding.guests || wedding.budget)
  );
}