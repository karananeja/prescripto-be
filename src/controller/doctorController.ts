import { NextFunction, Request, Response } from 'express';

import { doctorModel } from '../models/doctorModel';

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
