import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DoctorTokenPayload extends JwtPayload {
  id: string;
}

export const verifyDoctorAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      res.status(401).json({ success: false, message: 'Token is missing' });
      return;
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as DoctorTokenPayload;

    req.body.doctorId = decoded.id;

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
};
