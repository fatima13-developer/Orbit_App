import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload file buffer or local path to Cloudinary or fallback to local disk
 * @param {Express.Multer.File} file
 * @param {string} folder
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (file, folder = 'orbit') => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `orbit/${folder}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Graceful local fallback if Cloudinary is not configured
  const uploadsDir = path.resolve('uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname) || '.jpg';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, file.buffer);
  
  // Return URL accessible through express static /uploads/
  return {
    url: `/uploads/${fileName}`,
    publicId: `local-${fileName}`
  };
};

/**
 * Delete image from Cloudinary or local storage
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  if (publicId.startsWith('local-')) {
    const fileName = publicId.replace('local-', '');
    const filePath = path.resolve('uploads', fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`Could not delete local file ${filePath}:`, err.message);
      }
    }
    return;
  }

  if (isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn(`Cloudinary destroy error for ${publicId}:`, err.message);
    }
  }
};

export { cloudinary, isCloudinaryConfigured };
