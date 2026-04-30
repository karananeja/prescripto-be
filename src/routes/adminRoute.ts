import { Router } from 'express';

import { addDoctor, loginAdmin } from '../controller/adminController';
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
