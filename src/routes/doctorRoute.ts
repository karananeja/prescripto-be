import { Router } from 'express';

import { getAllDoctors, loginDoctor } from '../controller/doctorController';

export const doctorRouter = Router();

doctorRouter.get('/get-all-doctors', getAllDoctors);

doctorRouter.post('/login', loginDoctor);
