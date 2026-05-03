import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { doctorModel } from '../models/doctorModel';
import { adminSchema, doctorSchema } from '../utils/validationSchemas';

export const addDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the doctor info
    const parsedSchema = doctorSchema
      .pick({
        name: true,
        email: true,
        password: true,
        specialty: true,
        degree: true,
        experience: true,
        about: true,
        fee: true,
        address: true,
      })
      .partial()
      .extend({
        address: z.preprocess((val) => {
          if (typeof val === 'string') return JSON.parse(val);
          return val;
        }, doctorSchema.shape.address),

        fee: z.preprocess((val) => Number(val), z.number()),
      });

    parsedSchema.parse(req.body);
    const imageFile = req.file;

    if (!imageFile) {
      res.status(400).json({ success: false, message: 'Missing details' });
      return;
    }

    const existingDoctor = await doctorModel.findOne({ email: req.body.email });
    if (existingDoctor) {
      res
        .status(400)
        .json({ success: false, message: 'Doctor already exists' });
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
    await newDoctor.save();

    res.status(200).json({ success: true, message: 'Doctor Added' });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    // Validate the admin info
    adminSchema.parse({ email, password });

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      res.status(400).json({ success: false, message: 'Invalid Credentials' });
      return;
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ success: true, message: 'Login Successful', token });
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctors = await doctorModel.find().select('-password');

    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully',
      doctors,
    });
  } catch (error) {
    next(error);
  }
};
