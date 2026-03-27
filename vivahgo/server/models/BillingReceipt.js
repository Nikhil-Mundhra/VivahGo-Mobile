import mongoose from 'mongoose';

const billingReceiptSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['premium', 'studio'],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    baseAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    paymentProvider: {
      type: String,
      enum: ['razorpay', 'internal'],
      default: 'internal',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['paid', 'issued', 'payment_due', 'failed'],
      default: 'issued',
    },
    emailDeliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'skipped'],
      default: 'pending',
    },
    emailDeliveryError: {
      type: String,
      default: '',
    },
    issuedAt: {
      type: Date,
      default: () => new Date(),
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

export default mongoose.models.BillingReceipt || mongoose.model('BillingReceipt', billingReceiptSchema);
