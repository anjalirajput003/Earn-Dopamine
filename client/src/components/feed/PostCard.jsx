import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  Maximize,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  HandHelping,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { offerHelp } from "../../services/api/helpApi";

import {
  checkCheerStatus,
  checkSavedPost,
  cheerPost,
  createComment,
  deletePost,
  getPostComments,
  savePost,
  uncheerPost,
  unsavePost,
} from "../../services/api/postApi";

import { removePost } from "../../features/posts/postSlice";
import { showErrorToast, showSuccessToast } from "../common/toast";

const MEDIA_HEIGHT = { height: "min(52vh, 420px)" };

const CAPTION_CLAMP = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const timeAgo = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const seconds = (Date.now() - date.getTime()) / 1000;

  if (!Number.isFinite(seconds)) return "";
  if (seconds < 60) return "now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/* -------------------------------------------------------------------------
   Different backends spell this differently. Read whichever one exists so
   the heart shows up filled on load if the user already cheered this post.
------------------------------------------------------------------------- */
const readCheeredFlag = (post, userId) => {
  if (typeof post?.isCheered === "boolean") return post.isCheered;
  if (typeof post?.cheered === "boolean") return post.cheered;
  if (typeof post?.hasCheered === "boolean") return post.hasCheered;

  if (Array.isArray(post?.cheers) && userId) {
    return post.cheers.some((entry) => {
      const id = entry?.user?._id ?? entry?.user ?? entry?._id ?? entry;
      return String(id) === String(userId);
    });
  }

  return false;
};

const readCheersCount = (post) => {
  if (typeof post?.cheersCount === "number") return post.cheersCount;
  if (Array.isArray(post?.cheers)) return post.cheers.length;
  return 0;
};

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id;

  const owner = post.owner;
  const media = post.media || [];

  const isOwner =
    currentUserId && owner?._id && String(currentUserId) === String(owner._id);

  // --------------------------------
  // Post state
  // --------------------------------

  const [isCheered, setIsCheered] = useState(() =>
    readCheeredFlag(post, currentUserId),
  );
  const [cheersCount, setCheersCount] = useState(() => readCheersCount(post));

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [commentText, setCommentText] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isCheering, setIsCheering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [isOfferingHelp, setIsOfferingHelp] = useState(false);

  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const menuRef = useRef(null);
  const commentInputRef = useRef(null);

  // --------------------------------
  // Video state
  // --------------------------------

  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --------------------------------
  // Keep cheer state in sync when the feed refetches
  // --------------------------------

  useEffect(() => {
    setCheersCount(readCheersCount(post));
    setCommentsCount(post.commentsCount || 0);
  }, [post]);

  // --------------------------------
  // Load save status
  // --------------------------------

  useEffect(() => {
    let active = true;

    const loadSaveStatus = async () => {
      try {
        const response = await checkSavedPost(post._id);

        if (active) setIsSaved(Boolean(response.data?.saved));
      } catch {
        if (active) setIsSaved(false);
      }
    };

    loadSaveStatus();

    return () => {
      active = false;
    };
  }, [post._id]);

  // --------------------------------
  // Load cheer status
  // --------------------------------
  useEffect(() => {
    let active = true;

    const loadCheerStatus = async () => {
      try {
        const response = await checkCheerStatus(post._id);

        if (active) {
          setIsCheered(Boolean(response.data?.cheered));
        }
      } catch {
        if (active) {
          setIsCheered(false);
        }
      }
    };

    loadCheerStatus();

    return () => {
      active = false;
    };
  }, [post._id]);

  // --------------------------------
  // Close the options menu on outside click or Escape
  // --------------------------------

  useEffect(() => {
    if (!showMenu) {
      return;
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu]);

  // --------------------------------
  // Close the delete dialog on Escape
  // --------------------------------

  useEffect(() => {
    if (!showDeleteConfirm) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showDeleteConfirm, isDeleting]);

  // --------------------------------
  // Video listeners
  // --------------------------------

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const video = videoRef.current;

    if (!video) {
      return;
    }

    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("play", handlePlay);
    };
  }, [currentMediaIndex]);

  // --------------------------------
  // Video controls
  // --------------------------------

  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      showErrorToast("Couldn't play video", "Please try again.");
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = !video.muted;

    setIsMuted(video.muted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const newTime = Number(e.target.value);

    video.currentTime = newTime;

    setCurrentTime(newTime);
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await video.requestFullscreen();
    } catch {
      showErrorToast("Couldn't open fullscreen", "Please try again.");
    }
  };

  const formatTime = (time) => {
    if (!Number.isFinite(time)) {
      return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // --------------------------------
  // Cheer — flips instantly, rolls back if the request fails
  // --------------------------------

  const handleCheer = async () => {
    if (isCheering) {
      return;
    }

    const next = !isCheered;
    const previousCount = cheersCount;

    setIsCheered(next);
    setCheersCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    setIsCheering(true);

    try {
      if (next) {
        await cheerPost(post._id);
      } else {
        await uncheerPost(post._id);
      }
    } catch (error) {
      setIsCheered(!next);
      setCheersCount(previousCount);

      showErrorToast(
        "Couldn't update cheer",
        error.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setIsCheering(false);
    }
  };

  // --------------------------------
  // Save
  // --------------------------------

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const next = !isSaved;

    setIsSaved(next);
    setIsSaving(true);

    try {
      if (next) {
        await savePost(post._id);

        showSuccessToast(
          "Post saved",
          "The post was added to your saved posts.",
        );
      } else {
        await unsavePost(post._id);

        showSuccessToast(
          "Post unsaved",
          "The post was removed from your saved posts.",
        );
      }
    } catch (error) {
      setIsSaved(!next);

      showErrorToast(
        "Couldn't update save",
        error.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------
  // Comments
  // --------------------------------

  const handleToggleComments = async () => {
    const nextState = !showComments;

    setShowComments(nextState);

    if (!nextState) {
      return;
    }

    window.setTimeout(() => commentInputRef.current?.focus(), 0);

    if (comments.length > 0) {
      return;
    }

    setIsLoadingComments(true);

    try {
      const response = await getPostComments(post._id);

      setComments(response.data?.comments || []);
    } catch (error) {
      showErrorToast(
        "Couldn't load comments",
        error.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    const content = commentText.trim();

    if (!content || isSubmittingComment) {
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await createComment(post._id, content);

      setComments((prev) => [response.data, ...prev]);
      setCommentsCount((prev) => prev + 1);

      setCommentText("");

      showSuccessToast("Comment added", "Your comment was posted.");
    } catch (error) {
      showErrorToast(
        "Couldn't add comment",
        error.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleOfferHelp = async (e) => {
    e.preventDefault();

    if (isOwner || isOfferingHelp) return;

    setIsOfferingHelp(true);

    try {
      await offerHelp(post._id, helpMessage.trim());

      setShowHelpModal(false);
      setHelpMessage("");

      showSuccessToast("Help offered", "The post owner has been notified.");
    } catch (error) {
      showErrorToast(
        "Couldn't offer help",
        error.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setIsOfferingHelp(false);
    }
  };

  // --------------------------------
  // Delete
  // --------------------------------

  const handleDelete = async () => {
    if (!isOwner || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePost(post._id);

      dispatch(removePost(post._id));

      showSuccessToast("Post deleted", "Your post has been deleted.");
    } catch (error) {
      showErrorToast(
        "Couldn't delete post",
        error.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  // --------------------------------
  // Copy link
  // --------------------------------

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/posts/${post._id}`,
      );

      setShowMenu(false);

      showSuccessToast("Link copied", "Post link copied to clipboard.");
    } catch {
      showErrorToast("Couldn't copy link", "Please try again.");
    }
  };

  // --------------------------------
  // Media navigation
  // --------------------------------

  const goToPreviousMedia = () => {
    setCurrentMediaIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => Math.min(prev + 1, media.length - 1));
  };

  const currentMedia = media[currentMediaIndex];
  const isVideo = currentMedia?.type === "video";
  const hasLongCaption = (post.caption || "").length > 110;

  const handleOwnerProfileClick = () => {
    if (!owner?.username) return;

    navigate(`/profile/${owner.username}`);
  };

  return (
    <>
      <article className="mb-4 overflow-hidden rounded-2xl border border-neutral-800 bg-[#111111]">
        {/* --------------------------------
            HEADER
        -------------------------------- */}

        <div className="relative z-20 flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={handleOwnerProfileClick}
            className="flex min-w-0 items-center gap-2.5 text-left"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-800">
              {owner?.avatar?.url ? (
                <img
                  src={owner.avatar.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                  {owner?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="flex min-w-0 items-baseline gap-2">
              <p className="truncate text-sm font-semibold text-white">
                {owner?.username || "Unknown user"}
              </p>

              {owner?.fullName && (
                <p className="hidden truncate text-xs text-neutral-600 sm:block">
                  {owner.fullName}
                </p>
              )}

              <span className="shrink-0 text-xs text-neutral-600">
                {timeAgo(post.createdAt)}
              </span>
            </div>
          </button>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Post options"
              aria-expanded={showMenu}
              className="rounded-full p-1.5 text-neutral-500 transition hover:bg-neutral-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-9 z-40 w-44 overflow-hidden rounded-xl border border-neutral-800 bg-[#181818] shadow-2xl">
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                    Delete post
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-300 transition hover:bg-neutral-800"
                >
                  <Copy size={15} />
                  Copy link
                </button>

                <button
                  type="button"
                  onClick={() => setShowMenu(false)}
                  className="flex w-full items-center gap-3 border-t border-neutral-800 px-4 py-2.5 text-left text-sm text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
                >
                  <X size={15} />
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------
            MEDIA — fixed height, never cropped.
            overflow-hidden clips the blurred backdrop, and the backdrop is
            pointer-events-none so it can never intercept a click.
        -------------------------------- */}

        {media.length > 0 && currentMedia && (
          <div className="relative overflow-hidden bg-black">
            {!isVideo && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 scale-125 bg-cover bg-center opacity-25 blur-2xl"
                style={{ backgroundImage: `url("${currentMedia.url}")` }}
              />
            )}

            <div
              className="relative flex w-full items-center justify-center"
              style={MEDIA_HEIGHT}
            >
              {isVideo ? (
                <>
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    preload="metadata"
                    playsInline
                    onClick={togglePlay}
                    className="h-full w-full cursor-pointer object-contain"
                  />

                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label="Play video"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75">
                        <Play size={22} fill="currentColor" />
                      </span>
                    </button>
                  )}

                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-10">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                        className="shrink-0 text-white transition hover:text-neutral-300"
                      >
                        {isPlaying ? (
                          <Pause size={16} fill="currentColor" />
                        ) : (
                          <Play size={16} fill="currentColor" />
                        )}
                      </button>

                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-white">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        aria-label="Seek video"
                        className="h-1 min-w-0 flex-1 cursor-pointer accent-white"
                      />

                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                        className="shrink-0 text-white transition hover:text-neutral-300"
                      >
                        {isMuted ? (
                          <VolumeX size={16} />
                        ) : (
                          <Volume2 size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleFullscreen}
                        aria-label="Fullscreen"
                        className="shrink-0 text-white transition hover:text-neutral-300"
                      >
                        <Maximize size={16} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={currentMedia.url}
                  alt={post.caption || "Post image"}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Previous */}
            {media.length > 1 && currentMediaIndex > 0 && (
              <button
                type="button"
                onClick={goToPreviousMedia}
                aria-label="Previous media"
                className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {/* Next */}
            {media.length > 1 && currentMediaIndex < media.length - 1 && (
              <button
                type="button"
                onClick={goToNextMedia}
                aria-label="Next media"
                className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80"
              >
                <ChevronRight size={18} />
              </button>
            )}

            {/* Position + dots */}
            {media.length > 1 && (
              <>
                <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
                  {currentMediaIndex + 1}/{media.length}
                </div>

                {!isVideo && (
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                    {media.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentMediaIndex(index)}
                        aria-label={`Go to media ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentMediaIndex
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/45"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --------------------------------
            ACTIONS
        -------------------------------- */}

        <div className="relative z-20 flex items-center gap-1 px-3 pt-2.5">
          <button
            type="button"
            onClick={handleCheer}
            disabled={isCheering}
            aria-pressed={isCheered}
            aria-label={isCheered ? "Remove cheer" : "Cheer post"}
            className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium transition active:scale-95 ${
              isCheered
                ? "text-pink-500 hover:bg-pink-500/10"
                : "text-neutral-300 hover:bg-neutral-800/70 hover:text-white"
            }`}
          >
            <Heart
              size={20}
              strokeWidth={1.9}
              fill={isCheered ? "currentColor" : "none"}
              className="transition-colors"
            />
            {cheersCount > 0 && (
              <span className="tabular-nums">{cheersCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleComments}
            aria-label="Comments"
            aria-expanded={showComments}
            className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800/70 hover:text-white active:scale-95"
          >
            <MessageCircle size={20} strokeWidth={1.9} />
            {commentsCount > 0 && (
              <span className="tabular-nums">{commentsCount}</span>
            )}
          </button>

          {!isOwner && (
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              aria-label="Offer help"
              className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-neutral-300 transition hover:bg-purple-500/10 hover:text-purple-400 active:scale-95"
            >
              <HandHelping size={19} strokeWidth={1.9} />
              <span className="hidden sm:inline">Help</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Share post"
            className="rounded-full px-2 py-1.5 text-neutral-300 transition hover:bg-neutral-800/70 hover:text-white active:scale-95"
          >
            <Send size={19} strokeWidth={1.9} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from saved" : "Save post"}
            className={`ml-auto rounded-full px-2 py-1.5 transition hover:bg-neutral-800/70 active:scale-95 ${
              isSaved ? "text-white" : "text-neutral-300 hover:text-white"
            }`}
          >
            <Bookmark
              size={20}
              strokeWidth={1.9}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* --------------------------------
            CAPTION
        -------------------------------- */}

        {post.caption ? (
          <div className="px-4 pb-4 pt-1.5">
            <p
              className="text-sm leading-6 text-neutral-300"
              style={isCaptionExpanded ? undefined : CAPTION_CLAMP}
            >
              <span className="mr-1.5 font-semibold text-white">
                {owner?.username}
              </span>
              {post.caption}
            </p>

            {hasLongCaption && (
              <button
                type="button"
                onClick={() => setIsCaptionExpanded((prev) => !prev)}
                className="mt-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-300"
              >
                {isCaptionExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        ) : (
          <div className="pb-3" />
        )}

        {/* --------------------------------
            COMMENTS
        -------------------------------- */}

        {showComments && (
          <div className="border-t border-neutral-800 px-4 py-3">
            {isLoadingComments ? (
              <p className="py-2 text-sm text-neutral-600">Loading comments…</p>
            ) : comments.length === 0 ? (
              <p className="py-2 text-sm text-neutral-600">
                No comments yet. Start the conversation.
              </p>
            ) : (
              <div className="max-h-[220px] space-y-3 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-semibold text-white">
                      {comment.user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white">
                        {comment.user?.username || "User"}
                      </p>

                      <p className="mt-0.5 text-sm leading-5 text-neutral-400">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmitComment}
              className="mt-3 flex items-center gap-2.5 rounded-full bg-neutral-900 px-3 py-1.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-semibold text-white">
                {currentUser?.username?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                maxLength={2000}
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-white outline-none placeholder:text-neutral-600"
              />

              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="shrink-0 text-sm font-semibold text-[#0095f6] transition hover:text-[#38a9f9] disabled:opacity-40"
              >
                {isSubmittingComment ? "Posting…" : "Post"}
              </button>
            </form>
          </div>
        )}
      </article>

      {/* --------------------------------
          help MODAL
      -------------------------------- */}

      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isOfferingHelp) {
              setShowHelpModal(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-[#181818] shadow-2xl">
            <div className="border-b border-neutral-800 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Offer help
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Let {owner?.username || "the creator"} know how you can
                    help.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  disabled={isOfferingHelp}
                  className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleOfferHelp}>
              <div className="p-5">
                <textarea
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  placeholder="Tell them how you can help..."
                  maxLength={500}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-neutral-800 bg-[#111111] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-purple-500/50"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-neutral-600">
                    {helpMessage.length}/500
                  </span>
                </div>
              </div>

              <div className="flex border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  disabled={isOfferingHelp}
                  className="flex-1 border-r border-neutral-800 py-3 text-sm font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isOfferingHelp}
                  className="flex-1 py-3 text-sm font-semibold text-purple-400 transition hover:bg-purple-500/10 disabled:opacity-50"
                >
                  {isOfferingHelp ? "Offering…" : "Offer Help"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------
          DELETE MODAL
      -------------------------------- */}

      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Delete post"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-neutral-800 bg-[#181818] shadow-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 size={21} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                Delete this post?
              </h3>

              <p className="mt-2 text-sm leading-5 text-neutral-500">
                It will be removed from your profile and the feed. This can't be
                undone.
              </p>
            </div>

            <div className="flex border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 border-r border-neutral-800 py-3 text-sm font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50"
              >
                Keep post
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};;

export default PostCard;
