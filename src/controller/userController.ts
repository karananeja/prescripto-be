import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { userModel } from '../models/userModel';
import { userSchema } from '../utils/validationSchemas';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the user info
    userSchema
      .pick({ email: true, name: true, password: true })
      .partial()
      .parse(req.body);

    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userData = { ...req.body, password: hashedPassword };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const { email, _id } = user;

    const token = jwt.sign({ email, id: _id }, process.env.JWT_SECRET!, {
      expiresIn: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: 'User registered successfully', token });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the user info
    userSchema.pick({ email: true, password: true }).partial().parse(req.body);

    const userData = await userModel.findOne({ email: req.body.email });
    if (!userData) {
      res.status(400).json({ success: false, message: 'User not found' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      userData.password
    );
    if (!isPasswordCorrect) {
      res.status(400).json({ success: false, message: 'Invalid password' });
      return;
    }

    const { email, _id } = userData;

    const token = jwt.sign({ email, id: _id }, process.env.JWT_SECRET!, {
      expiresIn: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: 'User logged in successfully', token });
  } catch (error) {
    next(error);
  }
};

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await userModel.findById(req.body.userId).select('-password');
    res
      .status(200)
      .json({ success: true, message: 'User info fetched successfully', user });
  } catch (error) {
    next(error);
  }
};

export const updateUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate only allowed fields
    const validatedData = userSchema
      .pick({
        name: true,
        phone: true,
        address: true,
        gender: true,
        dob: true,
        image: true,
      })
      .partial()
      .parse(req.body);

    const user = await userModel.findById(req.body.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Handle address safely
    if (validatedData.address) {
      try {
        validatedData.address =
          typeof validatedData.address === 'string'
            ? JSON.parse(validatedData.address)
            : validatedData.address;
      } catch {
        res
          .status(400)
          .json({ success: false, message: 'Invalid address format' });
        return;
      }
    }

    // Handle optional image upload
    if (req.file) {
      const uploadImage = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
      });

      validatedData.image = uploadImage.secure_url;
    }

    // Apply updates safely
    Object.assign(user, validatedData);

    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'User info updated successfully', user });
  } catch (error) {
    next(error);
  }
};
