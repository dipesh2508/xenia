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
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any
});

const uploadMiddleware = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Create an upload object with optional method - fix the implementation
export const upload = {
  single: (fieldName: string) => uploadMiddleware.single(fieldName),
  optional: function() {
    return {
      single: (fieldName: string) => (req: any, res: any, next: any) => {
        // If there's no file, bypass multer
        if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
          return next();
        }
        
        // Use multer to handle the file upload
        uploadMiddleware.single(fieldName)(req, res, (err: any) => {
          if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ message: err.message });
          }
          next();
        });
      }
    };
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted image: ${publicId}`);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

export const getPublicIdFromUrl = (url: string) => {
  const splits = url.split('/');
  const filename = splits[splits.length - 1] || '';
  return `xenia-communities/${filename.split('.')[0]}`;
};
