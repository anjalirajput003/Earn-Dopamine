import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

import env from "../config/env.js";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
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

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) {
    return;
  }

  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

const uploadMultipleToCloudinary = async (files, folder) => {
  return await Promise.all(
    files.map(async (file) => {
      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      const uploadedFile = await uploadToCloudinary(
        file.buffer,
        folder,
        resourceType,
      );

      return {
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        type: resourceType,
      };
    }),
  );
};

export { uploadToCloudinary, deleteFromCloudinary, uploadMultipleToCloudinary };
