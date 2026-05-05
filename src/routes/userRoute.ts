import { Router } from 'express';

import {
  bookAppointment,
  getAllAppointments,
  getUserInfo,
  loginUser,
  registerUser,
  updateUserInfo,
} from '../controller/userController';
import { verifyUserAccessToken } from '../middlewares/authUser';
import { upload } from '../middlewares/multer';

export const userRouter = Router();

userRouter.post('/register', registerUser);

userRouter.post('/login', loginUser);

userRouter.get('/get-user-info', verifyUserAccessToken, getUserInfo);

userRouter.put(
  '/update-user-info',
  upload.single('image'),
  verifyUserAccessToken,
  updateUserInfo
);

userRouter.post('/book-appointment', verifyUserAccessToken, bookAppointment);

userRouter.get(
  '/get-my-appointments',
  verifyUserAccessToken,
  getAllAppointments
);
