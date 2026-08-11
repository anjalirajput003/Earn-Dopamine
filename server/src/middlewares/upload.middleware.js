import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new ApiError(400, "Only image files are allowed."));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
