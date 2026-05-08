import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { appointmentModel } from '../models/appointmentModel';
import { doctorModel } from '../models/doctorModel';
import { userModel } from '../models/userModel';
import { razorpayInstance } from '../utils/helpers';
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

    const userData = await userModel
      .findOne({ email: req.body.email })
      .select('-__v');
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
      userData: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        image: user.image,
      },
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

export const getAppointments = async (
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

    res.status(200).json({
      success: true,
      message: 'Appointments fetched successfully',
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId, userId } = req.body;

    const user = await userModel.findById(userId).select(['-password', '-__v']);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const appointment = await appointmentModel
      .findById(appointmentId)
      .select(['-__v']);
    if (!appointment) {
      res
        .status(404)
        .json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (appointment.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (appointment.cancelled) {
      res
        .status(400)
        .json({ success: false, message: 'Appointment already cancelled' });
      return;
    }

    appointment.cancelled = true;
    await appointment.save();

    await doctorModel.updateOne(
      { _id: appointment.docId },
      {
        $pull: {
          [`slotsBooked.${appointment.slotDate}`]: appointment.slotTime,
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const makePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId, userId } = req.body;

    const user = await userModel.findById(userId).select(['-password', '-__v']);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const appointment = await appointmentModel
      .findById(appointmentId)
      .select(['-__v']);
    if (!appointment) {
      res
        .status(404)
        .json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (appointment.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (appointment.cancelled) {
      res
        .status(400)
        .json({ success: false, message: 'Appointment already cancelled' });
      return;
    }

    const options = {
      amount: appointment.amount * 100,
      currency: process.env.CURRENCY!,
      receipt: appointmentId,
      notes: { appointmentId: appointmentId, userId: userId },
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      message: 'Payment order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { razorpay_order_id, userId } = req.body;

    const user = await userModel.findById(userId).select(['-password', '-__v']);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (!orderInfo) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (orderInfo.status !== 'paid') {
      res
        .status(400)
        .json({ success: false, message: 'Payment not successful' });
      return;
    }

    const appointment = await appointmentModel
      .findById(orderInfo.receipt)
      .select(['-__v']);
    if (!appointment) {
      res
        .status(404)
        .json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (appointment.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (appointment.payment) {
      res.status(400).json({ success: false, message: 'Payment already made' });
      return;
    }

    appointment.payment = true;
    await appointment.save();

    res
      .status(200)
      .json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
};
