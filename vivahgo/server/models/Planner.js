import mongoose from 'mongoose';

const plannerSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Array of marriage plans with metadata
    marriages: {
      type: [
        {
          id: String, // UUID or timestamp
          bride: String,
          groom: String,
          date: String,
          venue: String,
          budget: String,
          guests: String,
          template: String, // 'blank', 'traditional', 'modern', 'minimalist', 'adventure'
          createdAt: {
            type: Date,
            default: () => new Date(),
          },
        },
      ],
      default: [],
    },
    // ID of the currently active marriage plan
    activePlanId: {
      type: String,
      default: null,
    },
    // Legacy wedding field for backward compatibility
    wedding: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    // All data items now include planId field for filtering
    events: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    expenses: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    guests: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    vendors: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    tasks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

export default mongoose.models.Planner || mongoose.model('Planner', plannerSchema);