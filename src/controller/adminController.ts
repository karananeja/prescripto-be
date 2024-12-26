import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { doctorModel } from '../models/doctorModel';
import { doctorSchema } from '../utils/validationSchemas';

export const addDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the doctor info
    doctorSchema.parse(req.body);
    const imageFile = req.file;

    if (!imageFile) {
      res.status(400).json({ success: false, message: 'Missing details' });
      return;
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Upload the image to cloudinary
    const uploadImage = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: 'image',
    });
    const imageUrl = uploadImage.secure_url;

    const doctorData = {
      ...req.body,
      image: imageUrl,
      password: hashedPassword,
      address: JSON.parse(req.body.address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    newDoctor.save();

    res.status(200).json({ success: true, message: 'Doctor Added' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Missing details' });
    }
    next(error);
  }
};
