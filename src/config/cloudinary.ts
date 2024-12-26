import { v2 as cloudinary } from 'cloudinary';

export const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log(
    '\x1b[32m[cloudinary] Connection is set up with Cloudinary\x1b[0m'
  );
};
