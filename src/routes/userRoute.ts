import { Router } from 'express';

import {
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
  verifyUserAccessToken,
  upload.single('image'),
  updateUserInfo
);
