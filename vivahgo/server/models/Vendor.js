import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
    sortOrder: { type: Number, default: 0 },
    filename: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: true }
);

const vendorSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Venue', 'Photography', 'Catering', 'Decoration', 'Music', 'Pandit'],
      required: true,
    },
    description: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    isApproved: { type: Boolean, default: false },
    media: { type: [mediaSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
