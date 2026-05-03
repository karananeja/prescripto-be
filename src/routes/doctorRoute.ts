import { Router } from 'express';

import { getAllDoctors } from '../controller/doctorController';

export const doctorRouter = Router();

doctorRouter.get('/get-all-doctors', getAllDoctors);
