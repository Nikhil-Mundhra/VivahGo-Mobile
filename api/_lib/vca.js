const { buildChoiceProfileName } = require('./vendor-choice');

const DEFAULT_VCA_TYPES = [
  'Venue',
  'Photography',
  'Catering',
  'Wedding Invitations',
  'Wedding Gifts',
  'Music',
  'Wedding Transportation',
  'Tent House',
  'Wedding Entertainment',
  'Florists',
  'Wedding Planners',
  'Wedding Videography',
  'Honeymoon',
  'Wedding Decorators',
  'Wedding Cakes',
  'Wedding DJ',
  'Pandit',
  'Photobooth',
  'Astrologers',
  'Party Places',
  'Choreographer',
  'Bridal & Pre-Bridal',
  'Groom Services',
];

function slugifyChoiceType(type) {
  return String(type || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildChoiceProfileId(type) {
  const slug = slugifyChoiceType(type);
  return slug ? `vca-${slug}` : '';
}

function buildDefaultChoiceProfileSeed(type) {
  const normalizedType = String(type || '').trim();
  return {
    _id: buildChoiceProfileId(normalizedType),
    type: normalizedType,
    businessName: buildChoiceProfileName(normalizedType),
    name: buildChoiceProfileName(normalizedType),
    subType: '',
    description: '',
    services: [],
    bundledServices: [],
    country: '',
    state: '',
    city: '',
    googleMapsLink: '',
    coverageAreas: [],
    budgetRange: null,
    phone: '',
    website: '',
    availabilitySettings: {
      hasDefaultCapacity: false,
      defaultMaxCapacity: 0,
      dateOverrides: [],
    },
    sourceVendorIds: [],
    selectedVendorMedia: [],
    media: [],
    isApproved: true,
    tier: 'Plus',
    isActive: true,
  };
}

module.exports = {
  DEFAULT_VCA_TYPES,
  buildChoiceProfileId,
  buildDefaultChoiceProfileSeed,
  slugifyChoiceType,
};
