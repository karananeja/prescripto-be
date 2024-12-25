import cors from 'cors';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('*', (_: Request, res: Response) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`[server] The port is listening on ${port}`);
});
