import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New' },
  source: { type: String, enum: ['Website', 'Instagram', 'Referral'], required: true }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
