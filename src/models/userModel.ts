import { model, models, Schema } from 'mongoose';

import { defaultImageInBase64 } from '../utils/helpers';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: defaultImageInBase64 },
  address: { type: Object, default: { line1: '', line2: '' } },
  gender: { type: String, default: 'Not Selected' },
  dob: { type: String, default: '1970-01-01' },
  phone: { type: String, default: '0000000000' },
});

export const userModel = models.user || model('user', userSchema);
