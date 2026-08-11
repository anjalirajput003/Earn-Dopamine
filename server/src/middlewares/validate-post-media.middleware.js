import ApiError from "../utils/ApiError.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const validatePostMedia = (req, res, next) => {
  const files = req.files || [];
  const caption = req.validatedData.body.caption.trim();

  const images = files.filter((file) => file.mimetype.startsWith("image/"));

  const videos = files.filter((file) => file.mimetype.startsWith("video/"));

  // At least caption or media
  if (!caption && files.length === 0) {
    return next(
      new ApiError(400, "A post must contain either a caption or media."),
    );
  }

  // Cannot upload both images and videos
  if (images.length > 0 && videos.length > 0) {
    return next(
      new ApiError(400, "A post cannot contain both images and videos."),
    );
  }

  // Only one video
  if (videos.length > 1) {
    return next(new ApiError(400, "Only one video is allowed per post."));
  }

  // Maximum 10 images
  if (images.length > 10) {
    return next(new ApiError(400, "You can upload a maximum of 10 images."));
  }

  // Validate image sizes
  for (const image of images) {
    if (image.size > MAX_IMAGE_SIZE) {
      return next(new ApiError(400, "Each image must be smaller than 5 MB."));
    }
  }

  // Validate video size
  for (const video of videos) {
    if (video.size > MAX_VIDEO_SIZE) {
      return next(new ApiError(400, "Video must be smaller than 50 MB."));
    }
  }

  next();
};

export default validatePostMedia;
