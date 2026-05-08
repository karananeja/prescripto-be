import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

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

export const updateDoctorInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the doctor info
    const parsedSchema = doctorSchema
      .pick({ fee: true, address: true, available: true })
      .partial()
      .extend({
        address: z.preprocess((val) => {
          if (typeof val === 'string') return JSON.parse(val);
          return val;
        }, doctorSchema.shape.address),

        fee: z.preprocess((val) => Number(val), z.number()),
      });

    const validatedData = parsedSchema.parse(req.body);

    const doctor = await doctorModel
      .findById(req.body.doctorId)
      .select(['-password', '-__v']);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    // Apply updates safely
    Object.assign(doctor, validatedData);

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor info updated successfully',
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

export const completeAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointment = await appointmentModel
      .findById(req.body.appointmentId)
      .select(['-__v']);
    if (!appointment) {
      res
        .status(404)
        .json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (appointment.docId.toString() !== req.body.doctorId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (appointment.isCompleted) {
      res
        .status(400)
        .json({ success: false, message: 'Appointment already completed' });
      return;
    }

    appointment.isCompleted = true;
    await appointment.save();

    res
      .status(200)
      .json({ success: true, message: 'Appointment completed successfully' });
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
    const appointment = await appointmentModel
      .findById(req.body.appointmentId)
      .select(['-__v']);
    if (!appointment) {
      res
        .status(404)
        .json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (appointment.docId.toString() !== req.body.doctorId) {
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

    res
      .status(200)
      .json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await appointmentModel
      .find({ docId: req.body.doctorId })
      .select('-__v')
      .sort({ date: -1 })
      .limit(5);
    if (!appointments) {
      res
        .status(404)
        .json({ success: false, message: 'Appointments not found' });
      return;
    }

    let earnings = 0;
    const uniquePatients = new Set();

    appointments.forEach((appointment) => {
      if (appointment.isCompleted || appointment.payment)
        earnings += appointment.amount;
      uniquePatients.add(appointment.userId.toString());
    });

    const dashboardData = {
      earnings,
      appointments: appointments.length,
      patients: uniquePatients.size,
      latestAppointments: appointments,
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      dashboardData,
    });
  } catch (error) {
    next(error);
  }
};
