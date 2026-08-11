import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import env from "../config/env.js";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  return await cloudinary.uploader.destroy(publicId);
};

const uploadMultipleToCloudinary = async (files, folder) => {
  return await Promise.all(
    files.map(async (file) => {
      const uploadedFile = await uploadToCloudinary(file.buffer, folder);

      return {
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        type: file.mimetype.startsWith("image/") ? "image" : "video",
      };
    }),
  );
};

export { uploadToCloudinary, deleteFromCloudinary, uploadMultipleToCloudinary };
