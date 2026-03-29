import mongoose from 'mongoose';

const careerEmailTemplateSchema = new mongoose.Schema(
  {
    templateKey: { type: String, required: true, unique: true, trim: true, maxlength: 80, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 12000 },
    updatedBy: { type: String, default: '', trim: true, maxlength: 160 },
  },
  { timestamps: true }
);

export default mongoose.models.CareerEmailTemplate || mongoose.model('CareerEmailTemplate', careerEmailTemplateSchema);
