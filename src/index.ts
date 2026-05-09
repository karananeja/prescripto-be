// Importing the required dependencies into the application
import 'dotenv/config';

import cors from 'cors';
import express, { Request, Response } from 'express';

import { connectCloudinary } from './config/cloudinary';
import { connectDB } from './config/mongodb';
import { dbMiddleware } from './middlewares/dbMiddleware';
import { errorHandler } from './middlewares/errorMiddleware';
import { adminRouter } from './routes/adminRoute';
import { doctorRouter } from './routes/doctorRoute';
import { userRouter } from './routes/userRoute';

// Initializing the application
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API endpoints
app.use('/api/v1/admin', dbMiddleware, adminRouter);
app.use('/api/v1/doctor', dbMiddleware, doctorRouter);
app.use('/api/v1/user', dbMiddleware, userRouter);

// Setting up the port and database connection url
const port = process.env.PORT || 3000;
const mongoDbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zvcge.mongodb.net/${process.env.DB_NAME}`;

// Restrict all miscellaneous routes
app.get('*', (_: Request, res: Response) => {
  res.status(404).send('Not found');
});

// Global Error catch handler
app.use(errorHandler);

// Server started on the required port
app.listen(port, () => {
  console.log(`\x1b[32m[server] The port is listening on ${port}\x1b[0m`);
  // Connecting to the database
  connectDB(mongoDbURI);
  // Connecting to the cloudinary
  connectCloudinary();
});
