import { Image, Loader2, Upload, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { createNewPost } from "../../features/posts/postSlice";

import { showErrorToast, showSuccessToast } from "../common/Toast";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const CreatePostModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const { isCreating } = useSelector((state) => state.posts);

  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [previews, setPreviews] = useState([]);

  // Create preview URLs
  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [files]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    const hasVideo = selectedFiles.some((file) =>
      file.type.startsWith("video/"),
    );

    const hasImage = selectedFiles.some((file) =>
      file.type.startsWith("image/"),
    );

    // Image + video cannot be mixed
    if (hasVideo && hasImage) {
      showErrorToast(
        "Invalid media",
        "You cannot mix images and videos in one post.",
      );

      return;
    }

    // Video
    if (hasVideo) {
      if (selectedFiles.length > 1) {
        showErrorToast(
          "Too many videos",
          "Only one video is allowed per post.",
        );

        return;
      }

      if (selectedFiles[0].size > MAX_VIDEO_SIZE) {
        showErrorToast(
          "Video is too large",
          "Videos must be smaller than 50 MB.",
        );

        return;
      }
    }

    // Images
    if (hasImage) {
      if (selectedFiles.length > MAX_IMAGES) {
        showErrorToast(
          "Too many images",
          "You can upload a maximum of 10 images.",
        );

        return;
      }

      const oversizedImage = selectedFiles.find(
        (file) => file.size > MAX_IMAGE_SIZE,
      );

      if (oversizedImage) {
        showErrorToast(
          "Image is too large",
          "Each image must be smaller than 5 MB.",
        );

        return;
      }
    }

    setFiles(selectedFiles);

    // Reset input so selecting the same file again works
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedCaption = caption.trim();

    if (!trimmedCaption && files.length === 0) {
      showErrorToast("Nothing to post", "Add a photo, video, or caption.");

      return;
    }

    const result = await dispatch(
      createNewPost({
        files,
        caption: trimmedCaption,
        visibility,
      }),
    );

    if (createNewPost.fulfilled.match(result)) {
      showSuccessToast("Post published", "Your post is now on your feed.");

      onClose();
    } else {
      showErrorToast(
        "Couldn't create post",
        result.payload || "Something went wrong.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[#151515] shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <h2 className="text-base font-semibold text-white">
            Create new post
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-900 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Content */}

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          {/* Media preview */}

          {previews.length > 0 ? (
            <div className="border-b border-neutral-800 p-4">
              <div
                className={`grid gap-2 ${
                  previews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {previews.map((preview, index) => (
                  <div
                    key={`${preview.file.name}-${index}`}
                    className="group relative overflow-hidden rounded-xl bg-black"
                  >
                    {preview.type === "video" ? (
                      <video
                        src={preview.url}
                        controls
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <img
                        src={preview.url}
                        alt="Selected"
                        className="aspect-square w-full object-cover"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 border-b border-neutral-800 text-neutral-500 transition hover:bg-[#181818] hover:text-white"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
                <Upload size={26} />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  Select photos or videos
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  Images up to 5 MB • Video up to 50 MB
                </p>
              </div>
            </button>
          )}

          {/* Hidden file input */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Add media */}

          {previews.length > 0 && (
            <div className="px-5 pt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm font-medium text-[#0095f6] transition hover:text-[#38a9f9]"
              >
                <Image size={17} />
                Add more
              </button>
            </div>
          )}

          {/* Caption */}

          <div className="px-5 pt-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
              rows={4}
              placeholder="Write a caption..."
              className="w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-neutral-600"
            />

            <div className="text-right text-xs text-neutral-700">
              {caption.length}/2200
            </div>
          </div>

          {/* Visibility */}

          <div className="mx-5 mt-4 border-t border-neutral-800 py-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Visibility</p>

                <p className="mt-1 text-xs text-neutral-600">
                  Choose who can see your post.
                </p>
              </div>

              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="rounded-lg border border-neutral-800 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none"
              >
                <option value="public">Everyone</option>

                <option value="followers">Followers</option>

                <option value="private">Only me</option>
              </select>
            </label>
          </div>

          {/* Submit */}

          <div className="border-t border-neutral-800 p-5">
            <button
              type="submit"
              disabled={isCreating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0095f6] py-3 text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating && <Loader2 size={17} className="animate-spin" />}

              {isCreating ? "Publishing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
