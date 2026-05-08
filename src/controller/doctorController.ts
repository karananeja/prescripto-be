import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { appointmentModel } from '../models/appointmentModel';
import { doctorModel } from '../models/doctorModel';
import { doctorSchema } from '../utils/validationSchemas';

export const changeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { doctorId } = req.body;

    const docData = await doctorModel
      .findById(doctorId)
      .select(['-password', '-__v']);

    if (!docData) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    docData.available = !docData.available;
    await docData.save();

    res.status(200).json({ success: true, message: 'Availability changed' });
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
    const doctors = await doctorModel
      .find()
      .select(['-password', '-__v', '-email']);

    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully',
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const loginDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the doctor info
    doctorSchema
      .pick({ email: true, password: true })
      .partial()
      .parse(req.body);

    const doctor = await doctorModel
      .findOne({ email: req.body.email })
      .select('-__v');
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      doctor.password
    );
    if (!isPasswordCorrect) {
      res.status(400).json({ success: false, message: 'Invalid password' });
      return;
    }

    const { email, _id } = doctor;

    const token = jwt.sign({ email, id: _id }, process.env.JWT_SECRET!, {
      expiresIn: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: 'Doctor logged in successfully', token });
  } catch (error) {
    next(error);
  }
};

export const getDoctorInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctor = await doctorModel
      .findById(req.body.doctorId)
      .select(['-password', '-__v']);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Doctor info fetched successfully',
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await appointmentModel
      .find({ docId: req.body.doctorId })
      .select('-__v')
      .sort({ date: -1 });

    if (!appointments) {
      res
        .status(404)
        .json({ success: false, message: 'Appointments not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointments fetched successfully',
      appointments,
    });
  } catch (error) {
    next(error);
  }
};
