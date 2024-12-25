// Importing the required dependencies into the application
import cors from 'cors';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';

import { connectDB } from './config/mongodb';

config();

// Initializing the application
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Setting up the port and database connection url
const port = process.env.PORT || 3000;
const mongoDbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zvcge.mongodb.net/${process.env.DB_NAME}`;

// Restrict all miscellaneous routes
app.get('*', (_: Request, res: Response) => {
  res.status(404).send('Not found');
});

// Server started on the required port
app.listen(port, () => {
  console.log(`\x1b[32m[server] The port is listening on ${port}\x1b[0m`);
  // Connecting to the database
  connectDB(mongoDbURI);
});
