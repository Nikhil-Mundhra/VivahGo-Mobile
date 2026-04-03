import mongoose from 'mongoose';

const selectedVendorMediaSchema = new mongoose.Schema(
  {
    vendorId: { type: String, default: '', trim: true },
    vendorName: { type: String, default: '', trim: true },
    sourceMediaId: { type: String, default: '', trim: true },
    r2Url: { type: String, required: true, trim: true },
    mediaType: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
    sortOrder: { type: Number, default: 0 },
    filename: { type: String, default: '', trim: true, maxlength: 255 },
    size: { type: Number, default: 0, min: 0 },
    caption: { type: String, default: '', trim: true, maxlength: 280 },
    altText: { type: String, default: '', trim: true, maxlength: 180 },
    isCover: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
  },
  { _id: true }
);

const coverageAreaSchema = new mongoose.Schema(
  {
    country: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
  },
  { _id: true }
);

const availabilityOverrideSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, trim: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    maxCapacity: { type: Number, required: true, min: 0, max: 99 },
    bookingsCount: { type: Number, default: 0, min: 0, max: 99 },
  },
  { _id: true }
);

const availabilitySettingsSchema = new mongoose.Schema(
  {
    hasDefaultCapacity: { type: Boolean, default: true },
    defaultMaxCapacity: { type: Number, default: 1, min: 0, max: 99 },
    dateOverrides: { type: [availabilityOverrideSchema], default: [] },
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    key: { type: String, default: '', trim: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
    sortOrder: { type: Number, default: 0 },
    filename: { type: String, default: '', trim: true, maxlength: 255 },
    size: { type: Number, default: 0, min: 0 },
    caption: { type: String, default: '', trim: true, maxlength: 280 },
    altText: { type: String, default: '', trim: true, maxlength: 180 },
    isCover: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
  },
  { _id: true }
);

const choiceProfileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Venue', 'Photography', 'Catering', 'Wedding Invitations', 'Wedding Gifts', 'Music', 'Wedding Transportation', 'Tent House', 'Wedding Entertainment', 'Florists', 'Wedding Planners', 'Wedding Videography', 'Honeymoon', 'Wedding Decorators', 'Wedding Cakes', 'Wedding DJ', 'Pandit', 'Photobooth', 'Astrologers', 'Party Places', 'Choreographer', 'Bridal & Pre-Bridal', 'Groom Services', 'Bride', 'Groom'],
      required: true,
      unique: true,
      index: true,
    },
    businessName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    subType: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    services: { type: [String], default: [] },
    bundledServices: { type: [String], default: [] },
    country: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    googleMapsLink: { type: String, default: '', trim: true },
    coverageAreas: { type: [coverageAreaSchema], default: [] },
    budgetRange: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
    },
    phone: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    availabilitySettings: { type: availabilitySettingsSchema, default: () => ({}) },
    sourceVendorIds: { type: [String], default: [] },
    selectedVendorMedia: { type: [selectedVendorMediaSchema], default: [] },
    media: { type: [mediaSchema], default: [] },
    isApproved: { type: Boolean, default: true },
    tier: {
      type: String,
      enum: ['Free', 'Plus'],
      default: 'Plus',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ChoiceProfile || mongoose.model('ChoiceProfile', choiceProfileSchema);
