import { Router } from 'express';

import { addDoctor } from '../controller/adminController';
import { upload } from '../middlewares/multer';

export const adminRouter = Router();

adminRouter.post('/add-doctor', upload.single('image'), addDoctor);
