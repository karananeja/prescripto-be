// Importing the required dependencies into the application
import 'dotenv/config';

import cors from 'cors';
import express, { Request, Response } from 'express';

import { connectCloudinary } from './config/cloudinary';
import { connectDB } from './config/mongodb';
import { errorHandler } from './middlewares/errorMiddleware';
import { adminRouter } from './routes/adminRoute';
import { doctorRouter } from './routes/doctorRoute';
import { userRouter } from './routes/userRoute';

// Initializing the application
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database + cloudinary connection
const mongoDbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zvcge.mongodb.net/${process.env.DB_NAME}`;

connectDB(mongoDbURI);
connectCloudinary();

// Routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/user', userRouter);

// 404
app.get('*', (_: Request, res: Response) => {
  res.status(404).send('Not found');
});

// Error handler
app.use(errorHandler);

export default app;
