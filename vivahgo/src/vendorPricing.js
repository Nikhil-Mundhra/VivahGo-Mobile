export const MIN_VENDOR_BUDGET_LIMIT = 10000;
export const MAX_VENDOR_BUDGET_LIMIT = 150000001;
export const DEFAULT_VENDOR_BUDGET_RANGE = {
  min: 100000,
  max: 300000,
};

const BUDGET_STEP = 10000;
const MID_BUDGET_THRESHOLD = 200000;
const MID_BUDGET_STEP = 20000;
const HIGH_BUDGET_THRESHOLD = 500000;
const HIGH_BUDGET_STEP = 50000;
const LARGE_BUDGET_THRESHOLD = 1500000;
const LARGE_BUDGET_STEP = 100000;
const XL_BUDGET_THRESHOLD = 5000000;
const XL_BUDGET_STEP = 500000;
const XXL_BUDGET_THRESHOLD = 10000000;
const XXL_BUDGET_STEP = 1000000;
const ULTRA_BUDGET_THRESHOLD = 20000000;
const ULTRA_BUDGET_STEP = 5000000;
const MEGA_BUDGET_THRESHOLD = 60000000;
const MEGA_BUDGET_STEP = 10000000;

export function formatVendorBudgetInr(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function clampVendorBudgetValue(rawValue) {
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.min(
    MAX_VENDOR_BUDGET_LIMIT,
    Math.max(MIN_VENDOR_BUDGET_LIMIT, Math.round(numericValue))
  );
}

function buildBudgetSliderPoints() {
  const values = [];

  for (let value = MIN_VENDOR_BUDGET_LIMIT; value <= MID_BUDGET_THRESHOLD; value += BUDGET_STEP) {
    values.push(value);
  }
  for (let value = MID_BUDGET_THRESHOLD + MID_BUDGET_STEP; value <= HIGH_BUDGET_THRESHOLD; value += MID_BUDGET_STEP) {
    values.push(value);
  }
  for (let value = HIGH_BUDGET_THRESHOLD + HIGH_BUDGET_STEP; value <= LARGE_BUDGET_THRESHOLD; value += HIGH_BUDGET_STEP) {
    values.push(value);
  }
  for (let value = LARGE_BUDGET_THRESHOLD + LARGE_BUDGET_STEP; value <= XL_BUDGET_THRESHOLD; value += LARGE_BUDGET_STEP) {
    values.push(value);
  }
  for (let value = XL_BUDGET_THRESHOLD + XL_BUDGET_STEP; value <= XXL_BUDGET_THRESHOLD; value += XL_BUDGET_STEP) {
    values.push(value);
  }
  for (let value = XXL_BUDGET_THRESHOLD + XXL_BUDGET_STEP; value <= ULTRA_BUDGET_THRESHOLD; value += XXL_BUDGET_STEP) {
    values.push(value);
  }
  for (let value = ULTRA_BUDGET_THRESHOLD + ULTRA_BUDGET_STEP; value <= MEGA_BUDGET_THRESHOLD; value += ULTRA_BUDGET_STEP) {
    values.push(value);
  }
  for (let value = MEGA_BUDGET_THRESHOLD + MEGA_BUDGET_STEP; value <= MAX_VENDOR_BUDGET_LIMIT; value += MEGA_BUDGET_STEP) {
    values.push(value);
  }

  return values;
}

export const VENDOR_BUDGET_SLIDER_POINTS = buildBudgetSliderPoints();

export function findNearestVendorBudgetPointIndex(value, points = VENDOR_BUDGET_SLIDER_POINTS) {
  let nearestIndex = 0;
  let nearestDistance = Infinity;

  points.forEach((point, index) => {
    const distance = Math.abs(point - value);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export function normalizeVendorBudgetRange(range) {
  const rawMin = clampVendorBudgetValue(range?.min);
  const rawMax = clampVendorBudgetValue(range?.max);

  if (!Number.isFinite(rawMin) && !Number.isFinite(rawMax)) {
    return { ...DEFAULT_VENDOR_BUDGET_RANGE };
  }

  const safeMin = Number.isFinite(rawMin) ? rawMin : DEFAULT_VENDOR_BUDGET_RANGE.min;
  const safeMax = Number.isFinite(rawMax) ? rawMax : DEFAULT_VENDOR_BUDGET_RANGE.max;

  return {
    min: Math.min(safeMin, safeMax),
    max: Math.max(safeMin, safeMax),
  };
}

export function updateVendorBudgetRange(currentRange, field, rawValue) {
  const value = clampVendorBudgetValue(rawValue);
  if (!Number.isFinite(value)) {
    return null;
  }

  const normalizedRange = normalizeVendorBudgetRange(currentRange);
  if (field === 'min') {
    const nextMin = Math.min(value, normalizedRange.max);
    return {
      min: nextMin,
      max: Math.max(normalizedRange.max, nextMin),
    };
  }

  if (field === 'max') {
    const nextMax = Math.max(value, normalizedRange.min);
    return {
      min: Math.min(normalizedRange.min, nextMax),
      max: nextMax,
    };
  }

  return null;
}
