import { Router } from 'express';

import {
  cancelAppointment,
  completeAppointment,
  getAllDoctors,
  getDoctorAppointments,
  getDoctorInfo,
  loginDoctor,
} from '../controller/doctorController';
import { verifyDoctorAccessToken } from '../middlewares/authDoctor';

export const doctorRouter = Router();

doctorRouter.get('/get-all-doctors', getAllDoctors);

doctorRouter.post('/login', loginDoctor);

doctorRouter.get('/get-doctor-info', verifyDoctorAccessToken, getDoctorInfo);

doctorRouter.get(
  '/get-appointments',
  verifyDoctorAccessToken,
  getDoctorAppointments
);

doctorRouter.post(
  '/complete-appointment',
  verifyDoctorAccessToken,
  completeAppointment
);

doctorRouter.post(
  '/cancel-appointment',
  verifyDoctorAccessToken,
  cancelAppointment
);
