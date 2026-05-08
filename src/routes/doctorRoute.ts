import { Router } from 'express';

import {
  cancelAppointment,
  completeAppointment,
  getAllDoctors,
  getDashboardData,
  getDoctorAppointments,
  getDoctorInfo,
  loginDoctor,
  updateDoctorInfo,
} from '../controller/doctorController';
import { verifyDoctorAccessToken } from '../middlewares/authDoctor';

export const doctorRouter = Router();

doctorRouter.get('/get-all-doctors', getAllDoctors);

doctorRouter.post('/login', loginDoctor);

doctorRouter.get('/get-doctor-info', verifyDoctorAccessToken, getDoctorInfo);

doctorRouter.put(
  '/update-doctor-info',
  verifyDoctorAccessToken,
  updateDoctorInfo
);

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

doctorRouter.get(
  '/get-dashboard-data',
  verifyDoctorAccessToken,
  getDashboardData
);
