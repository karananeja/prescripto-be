// Importing the required dependencies into the application
import cors from 'cors';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';

config();

// Initializing the application
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Setting up the port
const port = process.env.PORT || 3000;

// Restrict all miscellaneous routes
app.get('*', (_: Request, res: Response) => {
  res.status(404).send('Not found');
});

// Server started on the required port
app.listen(port, () => {
  console.log(`[server] The port is listening on ${port}`);
});
