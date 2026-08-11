import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    return cb(null, true);
  }

  cb(new ApiError(400, "Only image and video files are allowed."));
};

const postUpload = multer({
  storage,

  fileFilter,

  limits: {
    files: 10,
    fileSize: 50 * 1024 * 1024,
  },
});

export default postUpload;
