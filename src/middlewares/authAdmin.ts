import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AdminTokenPayload extends JwtPayload {
  email: string;
}

export const verifyAdminAccessToken = (
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
    const decodedToken = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as AdminTokenPayload;

    const isAdmin = decodedToken.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
};
