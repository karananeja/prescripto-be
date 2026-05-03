import { Router } from 'express';

import {
  addDoctor,
  getAllDoctors,
  loginAdmin,
} from '../controller/adminController';
import { changeAvailability } from '../controller/doctorController';
import { verifyAdminAccessToken } from '../middlewares/authAdmin';
import { upload } from '../middlewares/multer';

export const adminRouter = Router();

adminRouter.post(
  '/add-doctor',
  verifyAdminAccessToken,
  upload.single('image'),
  addDoctor
);

adminRouter.post('/login', loginAdmin);

adminRouter.get('/get-all-doctors', verifyAdminAccessToken, getAllDoctors);

adminRouter.post(
  '/change-availability',
  verifyAdminAccessToken,
  changeAvailability
);
