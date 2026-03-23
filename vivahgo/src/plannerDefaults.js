import { DEFAULT_EVENTS, DEFAULT_TASKS, DEFAULT_VENDORS } from './data.js';

export const EMPTY_WEDDING = {
  bride: '',
  groom: '',
  date: '',
  venue: '',
  guests: '',
  budget: '',
};

// Generate unique ID for marriage plans
export function generatePlanId() {
  return `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Template definitions for new marriage plans
export const MARRIAGE_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Start Fresh',
    description: 'Create a blank planning canvas',
    emoji: '✨',
  },
  traditional: {
    id: 'traditional',
    name: 'Traditional Indian',
    description: 'Pre-populated with traditional ceremonies',
    emoji: '🪔',
  },
  modern: {
    id: 'modern',
    name: 'Modern Wedding',
    description: 'Contemporary celebration style',
    emoji: '💫',
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Intimate, essential elements only',
    emoji: '🎯',
  },
  adventure: {
    id: 'adventure',
    name: 'Adventure Wedding',
    description: 'Unique location-based celebration',
    emoji: '🏝️',
  },
};

const SAMPLE_GUESTS = [
  { id: 1, name: 'Rajesh Sharma', side: 'bride', phone: '+91 98765 43210', rsvp: 'yes', guestCount: 4 },
  { id: 2, name: 'Priya Mehta', side: 'bride', phone: '+91 98765 12345', rsvp: 'yes', guestCount: 2 },
  { id: 3, name: 'Vikram Singh', side: 'groom', phone: '+91 99887 56123', rsvp: 'pending', guestCount: 3 },
  { id: 4, name: 'Sunita Verma', side: 'groom', phone: '+91 91234 56789', rsvp: 'no', guestCount: 1 },
  { id: 5, name: 'Arjun Kapoor', side: 'bride', phone: '+91 87654 32109', rsvp: 'pending', guestCount: 5 },
];

const SAMPLE_EXPENSES = [
  { id: 1, name: 'Haldi venue advance', amount: 200000, expenseDate: '2027-02-10', category: 'venue', area: 'ceremony', eventId: 4, note: '50% advance' },
  { id: 2, name: 'Bridal lehenga', amount: 150000, expenseDate: '2026-11-20', category: 'attire', area: 'bride', eventId: '', note: 'Sabyasachi' },
  { id: 3, name: 'Guest hotel block', amount: 85000, expenseDate: '2027-01-15', category: 'stay', area: 'guests', eventId: '', note: '40 deluxe rooms reserved' },
];

function normalizeExpense(expense, planId) {
  if (!expense || typeof expense !== 'object') {
    return { id: Date.now(), name: '', amount: 0, expenseDate: '', category: 'misc', area: 'general', eventId: '', note: '', planId };
  }

  return {
    id: expense.id ?? Date.now(),
    name: expense.name || '',
    amount: Number(expense.amount || 0),
    expenseDate: expense.expenseDate || '',
    category: expense.category || 'misc',
    area: expense.area || (expense.eventId ? 'ceremony' : 'general'),
    eventId: expense.eventId ?? '',
    note: expense.note || '',
    planId: expense.planId || planId,
  };
}

function normalizeTask(task, planId) {
  if (!task || typeof task !== 'object') {
    return {
      id: Date.now(),
      name: '',
      done: false,
      due: '',
      priority: 'medium',
      group: 'Final',
      eventId: '',
      ceremony: 'General',
      planId,
    };
  }

  return {
    id: task.id ?? Date.now(),
    name: task.name || '',
    done: Boolean(task.done),
    due: task.due || '',
    priority: task.priority || 'medium',
    group: task.group || 'Final',
    eventId: task.eventId ?? '',
    ceremony: task.ceremony || 'General',
    planId: task.planId || planId,
  };
}

function cloneCollection(items) {
  return items.map(item => ({ ...item }));
}

function hasValidPlanId(item, validPlanIds) {
  return Boolean(item?.planId && validPlanIds.has(item.planId));
}

function normalizePlanScopedItems(items, activePlanId, validPlanIds) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter(item => item && typeof item === 'object')
    .map(item => {
      if (hasValidPlanId(item, validPlanIds)) {
        return { ...item };
      }

      // One-time migration for legacy records without a valid plan id.
      return {
        ...item,
        planId: activePlanId,
      };
    });
}

function createTemplateEvents(templateId, planId) {
  if (templateId === 'blank') {
    return [];
  }

  return cloneCollection(DEFAULT_EVENTS).map((event, index) => ({
    ...event,
    id: Date.now() + index,
    planId,
    status: 'upcoming',
    date: '',
    time: '',
    venue: '',
    note: '',
  }));
}

function createTemplateTasks(templateId, planId) {
  if (templateId === 'blank') {
    return [];
  }

  return cloneCollection(DEFAULT_TASKS).map((task, index) => normalizeTask({
    ...task,
    id: Date.now() + 100 + index,
    done: false,
    eventId: '',
    ceremony: 'General',
  }, planId));
}

function createTemplateVendors(templateId, planId) {
  if (templateId === 'blank') {
    return [];
  }

  return cloneCollection(DEFAULT_VENDORS).map((vendor, index) => ({
    ...vendor,
    id: Date.now() + 200 + index,
    booked: false,
    planId,
  }));
}

export function createTemplatePlanCollections(templateId, planId) {
  return {
    events: createTemplateEvents(templateId, planId),
    expenses: [],
    guests: [],
    vendors: createTemplateVendors(templateId, planId),
    tasks: createTemplateTasks(templateId, planId),
  };
}

function createDemoEvents(planId) {
  return cloneCollection(DEFAULT_EVENTS).map((event, index) => ({
    ...event,
    planId,
    date: ['12 Feb 2027', '13 Feb 2027', '13 Feb 2027', '14 Feb 2027', '14 Feb 2027', '15 Feb 2027'][index] || '',
    time: ['11:00 AM', '4:00 PM', '8:00 PM', '5:00 PM', '9:30 PM', '7:30 PM'][index] || '',
    venue: ['Jaipur Courtyard', 'Terrace Lawn', 'Royal Ballroom', 'Palace Entrance', 'Lotus Mandap', 'Sunset Pavilion'][index] || '',
    status: index < 2 ? 'confirmed' : 'upcoming',
    note: index === 4 ? 'Mandap setup by 7 PM' : '',
  }));
}

// Create a blank marriage plan
export function createBlankMarriagePlan(planId = null) {
  const id = planId || generatePlanId();
  return {
    id,
    bride: '',
    groom: '',
    date: '',
    venue: '',
    guests: '',
    budget: '',
    template: 'blank',
    createdAt: new Date(),
  };
}

// Create a demo marriage plan
export function createDemoMarriagePlan() {
  const planId = generatePlanId();
  return {
    id: planId,
    bride: 'Aarohi',
    groom: 'Kabir',
    date: '14 February 2027',
    venue: 'Jaipur Palace Grounds',
    guests: '320',
    budget: '6500000',
    template: 'traditional',
    createdAt: new Date(),
  };
}

// Create a blank planner with multi-marriage support
export function createBlankPlanner() {
  const planId = generatePlanId();
  return {
    marriages: [createBlankMarriagePlan(planId)],
    activePlanId: planId,
    wedding: { ...EMPTY_WEDDING },
    events: [],
    expenses: [],
    guests: [],
    vendors: [],
    tasks: [],
  };
}

// Create a demo planner with multi-marriage support
export function createDemoPlanner() {
  const demoMarriage = createDemoMarriagePlan();
  const planId = demoMarriage.id;
  
  return {
    marriages: [demoMarriage],
    activePlanId: planId,
    wedding: {
      bride: 'Aarohi',
      groom: 'Kabir',
      date: '14 February 2027',
      venue: 'Jaipur Palace Grounds',
      guests: '320',
      budget: '6500000',
    },
    events: createDemoEvents(planId),
    expenses: cloneCollection(SAMPLE_EXPENSES).map(e => normalizeExpense(e, planId)),
    guests: cloneCollection(SAMPLE_GUESTS).map(g => ({ ...g, planId })),
    vendors: cloneCollection(DEFAULT_VENDORS).map(v => ({ ...v, planId })),
    tasks: cloneCollection(DEFAULT_TASKS).map(t => normalizeTask(t, planId)),
  };
}

// Normalize planner to handle both old single-plan and new multi-plan formats
export function normalizePlanner(planner) {
  const blankPlanner = createBlankPlanner();

  if (!planner || typeof planner !== 'object') {
    return blankPlanner;
  }

  // Handle migration from old single-plan format
  let marriages = Array.isArray(planner.marriages) ? planner.marriages : [];
  let activePlanId = planner.activePlanId;

  // If no marriages but has old wedding data, migrate it
  if (marriages.length === 0 && planner.wedding && hasWeddingProfile(planner.wedding)) {
    const planId = generatePlanId();
    marriages = [{
      id: planId,
      bride: planner.wedding.bride || '',
      groom: planner.wedding.groom || '',
      date: planner.wedding.date || '',
      venue: planner.wedding.venue || '',
      guests: planner.wedding.guests || '',
      budget: planner.wedding.budget || '',
      template: 'blank',
      createdAt: new Date(),
    }];
    activePlanId = planId;
  }

  // Ensure we have at least one plan
  if (marriages.length === 0) {
    marriages = [createBlankMarriagePlan()];
    activePlanId = marriages[0].id;
  }

  // Ensure activePlanId is set and points to an existing plan
  if (!activePlanId || !marriages.some(m => m.id === activePlanId)) {
    activePlanId = marriages[0]?.id;
  }

  const validPlanIds = new Set(marriages.map(m => m.id).filter(Boolean));

  // Get the active marriage for wedding object
  const activeMarriage = marriages.find(m => m.id === activePlanId) || marriages[0];
  const wedding = {
    ...EMPTY_WEDDING,
    bride: activeMarriage.bride || '',
    groom: activeMarriage.groom || '',
    date: activeMarriage.date || '',
    venue: activeMarriage.venue || '',
    guests: activeMarriage.guests || '',
    budget: activeMarriage.budget || '',
  };

  const normalizedEvents = normalizePlanScopedItems(planner.events, activePlanId, validPlanIds);
  const normalizedExpenses = normalizePlanScopedItems(planner.expenses, activePlanId, validPlanIds)
    .map(e => normalizeExpense(e, activePlanId));
  const normalizedGuests = normalizePlanScopedItems(planner.guests, activePlanId, validPlanIds);
  const normalizedVendors = normalizePlanScopedItems(planner.vendors, activePlanId, validPlanIds);
  const normalizedTasks = normalizePlanScopedItems(planner.tasks, activePlanId, validPlanIds)
    .map(t => normalizeTask(t, activePlanId));

  return {
    marriages,
    activePlanId,
    wedding,
    events: normalizedEvents,
    expenses: normalizedExpenses,
    guests: normalizedGuests,
    vendors: normalizedVendors,
    tasks: normalizedTasks,
  };
}

export function hasWeddingProfile(wedding) {
  return Boolean(
    wedding && (wedding.bride || wedding.groom || wedding.date || wedding.venue || wedding.guests || wedding.budget)
  );
}