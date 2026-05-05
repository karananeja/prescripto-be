import { model, models, Schema } from 'mongoose';

import { defaultImageInBase64 } from '../utils/helpers';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    image: { type: String, default: defaultImageInBase64 },
    address: { type: Object, default: { line1: '', line2: '' } },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
    dob: { type: Date, default: null },
    phone: { type: String, default: null },
  },
  { timestamps: true }
);

export const userModel = models.user || model('user', userSchema);
