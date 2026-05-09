import { NextFunction, Request, Response } from 'express';

import { connectDB } from '../config/mongodb';

export const dbMiddleware = async (
  _: Request,
  __: Response,
  next: NextFunction
) => {
  try {
    const mongoDbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zvcge.mongodb.net/${process.env.DB_NAME}`;
    await connectDB(mongoDbURI);
    next();
  } catch (error) {
    next(error);
  }
};
