import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'xenia-communities',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any
});

const uploadMiddleware = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Create an upload object with optional method
export const upload = {
  ...uploadMiddleware,
  optional: () => ({
    ...uploadMiddleware,
    single: (fieldName: string) => (req: any, res: any, next: any) => {
      if (!req.files && !req.file) {
        return next();
      }
      return uploadMiddleware.single(fieldName)(req, res, next);
    }
  })
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

export const getPublicIdFromUrl = (url: string) => {
  const splits = url.split('/');
  const filename = splits[splits.length - 1] || '';
  return `xenia-communities/${filename.split('.')[0]}`;
};
