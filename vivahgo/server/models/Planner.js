import mongoose from 'mongoose';

const plannerSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    wedding: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
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