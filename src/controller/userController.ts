import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { appointmentModel } from '../models/appointmentModel';
import { doctorModel } from '../models/doctorModel';
import { userModel } from '../models/userModel';
import { appointmentSchema, userSchema } from '../utils/validationSchemas';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the user info
    userSchema
      .pick({ email: true, name: true, password: true })
      .partial()
      .parse(req.body);

    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userData = { ...req.body, password: hashedPassword };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const { email, _id } = user;

    const token = jwt.sign({ email, id: _id }, process.env.JWT_SECRET!, {
      expiresIn: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: 'User registered successfully', token });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the user info
    userSchema.pick({ email: true, password: true }).partial().parse(req.body);

    const userData = await userModel.findOne({ email: req.body.email });
    if (!userData) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      userData.password
    );
    if (!isPasswordCorrect) {
      res.status(400).json({ success: false, message: 'Invalid password' });
      return;
    }

    const { email, _id } = userData;

    const token = jwt.sign({ email, id: _id }, process.env.JWT_SECRET!, {
      expiresIn: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: 'User logged in successfully', token });
  } catch (error) {
    next(error);
  }
};

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await userModel
      .findById(req.body.userId)
      .select(['-password', '-__v']);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: 'User info fetched successfully', user });
  } catch (error) {
    next(error);
  }
};

export const updateUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the user info
    const parsedSchema = userSchema
      .pick({
        name: true,
        phone: true,
        address: true,
        gender: true,
        dob: true,
        image: true,
      })
      .partial()
      .extend({
        address: z.preprocess((val) => {
          if (typeof val === 'string') return JSON.parse(val);
          return val;
        }, userSchema.shape.address),
      });

    const validatedData = parsedSchema.parse(req.body);

    const user = await userModel
      .findById(req.body.userId)
      .select(['-password', '-__v']);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Upload the image to cloudinary
    if (req.file) {
      const uploadImage = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
      });

      validatedData.image = uploadImage.secure_url;
    }

    // Apply updates safely
    Object.assign(user, validatedData);

    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'User info updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    appointmentSchema.parse(req.body);

    const { userId, docId, slotDate, slotTime } = req.body;

    const user = await userModel.findById(userId).select(['-password', '-__v']);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const docData = await doctorModel
      .findById(docId)
      .select(['-password', '-__v']);
    if (!docData) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    if (!docData.available) {
      res
        .status(400)
        .json({ success: false, message: 'Doctor is not available' });
      return;
    }

    const updateResult = await doctorModel.updateOne(
      { _id: docId, [`slotsBooked.${slotDate}`]: { $ne: slotTime } },
      { $push: { [`slotsBooked.${slotDate}`]: slotTime } }
    );

    if (updateResult.modifiedCount === 0) {
      res.status(400).json({ success: false, message: 'Slot already booked' });
      return;
    }

    const appointmentData = {
      userId: user._id,
      docId: docData._id,
      slotDate,
      slotTime,
      userData: { name: user.name, email: user.email, phone: user.phone },
      docData: {
        name: docData.name,
        specialty: docData.specialty,
        fee: docData.fee,
        image: docData.image,
        address: docData.address,
      },
      amount: docData.fee,
      date: Date.now(),
    };

    await appointmentModel.create(appointmentData);

    res
      .status(200)
      .json({ success: true, message: 'Appointment booked successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId).select(['-password', '-__v']);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const appointments = await appointmentModel
      .find({ userId })
      .select(['-__v'])
      .sort({ date: -1 });
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    next(error);
  }
};
