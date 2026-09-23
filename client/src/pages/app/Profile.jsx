import {
  Camera,
  Check,
  ExternalLink,
  ImagePlus,
  MessageCircle,
  Loader2,
  Pencil,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PostCard from "../../components/feed/PostCard";

import {
  fetchFollowCounts,
  fetchFollowStatus,
  fetchUserProfile,
  followProfile,
  unfollowProfile,
} from "../../features/profile/profileSlice";

import { getUserPosts } from "../../services/api/postApi";

import {
  updateAvatar,
  updateCoverImage,
  updateProfile,
} from "../../services/api/profileApi";

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);

  const {
    profile,
    followCounts,
    isLoading,
    isFollowing,
    isFollowStatusLoading,
    error,
  } = useSelector((state) => state.profile);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    website: "",
    interests: "",
    productivityGoals: "",
  });

  const isOwnProfile =
    currentUser?.username?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    if (!username) return;

    dispatch(fetchUserProfile(username));
  }, [dispatch, username]);

  useEffect(() => {
    if (!profile?._id) return;

    dispatch(fetchFollowCounts(profile._id));

    if (!isOwnProfile) {
      dispatch(fetchFollowStatus(profile._id));
    }
  }, [dispatch, profile?._id, isOwnProfile]);

  useEffect(() => {
    if (!profile?.username) return;

    const loadPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(null);

        const response = await getUserPosts(profile.username, 1, 12);

        setPosts(response?.data?.posts ?? []);
        setPostCount(response?.data?.pagination?.totalPosts ?? 0);
      } catch (err) {
        setPostsError(err.response?.data?.message || "Failed to load posts.");
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, [profile?.username]);

  useEffect(() => {
    if (!profile) return;

    setForm({
      fullName: profile.fullName || "",
      bio: profile.bio || "",
      website: profile.website || "",
      interests: profile.interests?.join(", ") || "",
      productivityGoals: profile.productivityGoals?.join(", ") || "",
    });
  }, [profile]);

  const handleFollowToggle = () => {
    if (!profile?._id || isFollowing || isFollowStatusLoading || isOwnProfile) {
      return;
    }

    if (profile.isFollowing) {
      dispatch(unfollowProfile(profile._id));
    } else {
      dispatch(followProfile(profile._id));
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await updateProfile({
        fullName: form.fullName.trim(),
        bio: form.bio.trim(),
        website: form.website.trim(),
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        productivityGoals: form.productivityGoals
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      const updatedUser = response?.data;

      if (updatedUser) {
        setForm({
          fullName: updatedUser.fullName || "",
          bio: updatedUser.bio || "",
          website: updatedUser.website || "",
          interests: updatedUser.interests?.join(", ") || "",
          productivityGoals: updatedUser.productivityGoals?.join(", ") || "",
        });
      }

      setIsEditOpen(false);

      toast.success("Profile updated successfully.");

      dispatch(fetchUserProfile(username));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setIsUploadingAvatar(true);

      await updateAvatar(file);

      toast.success("Profile picture updated.");

      dispatch(fetchUserProfile(username));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update profile picture.",
      );
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setIsUploadingCover(true);

      await updateCoverImage(file);

      toast.success("Cover image updated.");

      dispatch(fetchUserProfile(username));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update cover image.",
      );
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[935px] px-4 pb-12">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={26} className="animate-spin text-neutral-500" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="mx-auto w-full max-w-[935px] px-4 pb-12">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
            <UserPlus size={25} className="text-neutral-600" />
          </div>

          <h1 className="mt-5 text-lg font-semibold text-white">
            Profile not found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {error || "This profile could not be loaded."}
          </p>
        </div>
      </main>
    );
  }

  const avatarUrl = profile.avatar?.url;
  const coverUrl = profile.coverImage?.url;

  return (
    <main className="mx-auto w-full max-w-[935px] px-4 pb-12">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverChange}
        className="hidden"
      />

      {/* Profile header */}
      <section className="border-b border-neutral-800 pb-8">
        {/* Cover */}
        <div className="relative h-48 overflow-hidden bg-neutral-900 sm:h-56">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900">
              <Camera size={32} className="text-neutral-700" />
            </div>
          )}

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="absolute bottom-4 right-4 flex items-center gap-2 border border-white/10 bg-black/70 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingCover ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              Change cover
            </button>
          )}
        </div>

        {/* Profile information */}
        <div className="px-2 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="-mt-12 shrink-0 sm:-mt-16">
              <button
                type="button"
                onClick={() => isOwnProfile && avatarInputRef.current?.click()}
                disabled={!isOwnProfile || isUploadingAvatar}
                className="group relative block rounded-full"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile.username}
                    className="h-28 w-28 rounded-full border-4 border-[#080808] object-cover sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#080808] bg-neutral-800 text-3xl font-semibold text-white sm:h-32 sm:w-32">
                    {profile.username?.charAt(0).toUpperCase()}
                  </div>
                )}

                {isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                    {isUploadingAvatar ? (
                      <Loader2 size={22} className="animate-spin text-white" />
                    ) : (
                      <Camera size={22} className="text-white" />
                    )}
                  </div>
                )}
              </button>
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1 pt-4 sm:pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <h1 className="truncate text-xl font-semibold text-white">
                    {profile.username}
                  </h1>

                  {profile.isVerified && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0095f6]">
                      <Check size={12} strokeWidth={3} className="text-white" />
                    </span>
                  )}
                </div>

                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center justify-center gap-2 border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <Pencil size={15} />
                    Edit profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/messages?userId=${profile._id}`)
                      }
                      className="inline-flex items-center justify-center gap-2 border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      <MessageCircle size={15} />
                      Message
                    </button>

                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      disabled={isFollowing || isFollowStatusLoading}
                      className={`inline-flex min-w-[110px] items-center justify-center gap-2 px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        profile.isFollowing
                          ? "border border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
                          : "bg-[#0095f6] text-white hover:bg-[#0086e0]"
                      }`}
                    >
                      {isFollowing ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : profile.isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-1 text-sm text-neutral-500">
                {profile.fullName}
              </p>

              {/* Stats */}
              <div className="mt-5 flex items-center gap-7 text-sm">
                <div>
                  <span className="font-semibold text-white">{postCount}</span>{" "}
                  <span className="text-neutral-400">posts</span>
                </div>

                <div>
                  <span className="font-semibold text-white">
                    {followCounts.followers}
                  </span>{" "}
                  <span className="text-neutral-400">followers</span>
                </div>

                <div>
                  <span className="font-semibold text-white">
                    {followCounts.following}
                  </span>{" "}
                  <span className="text-neutral-400">following</span>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-5 max-w-[600px]">
                {profile.bio && (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                    {profile.bio}
                  </p>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-medium text-[#4ea1ff] hover:underline"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    <span className="truncate">{profile.website}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="mt-7">
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {profile.productivityGoals?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Productivity goals
              </p>

              <div className="flex flex-wrap gap-2">
                {profile.productivityGoals.map((goal) => (
                  <span
                    key={goal}
                    className="border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="mt-2">
        <div className="flex h-12 items-center justify-center border-b border-neutral-800">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
            Posts
          </span>
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-neutral-600" />
          </div>
        ) : postsError ? (
          <div className="py-20 text-center text-sm text-neutral-500">
            {postsError}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800">
              <Camera size={25} className="text-neutral-600" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-white">
              No posts yet
            </h2>

            {isOwnProfile && (
              <p className="mt-1 text-sm text-neutral-500">
                Share something to start your profile.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {posts.map((post) => {
              const media = post.media?.[0];

              if (!media?.url) return null;

              return (
                <button
                  key={post._id}
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="group relative aspect-square overflow-hidden bg-neutral-900 text-left"
                >
                  <img
                    src={media.url}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <span className="text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                      View post
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit profile modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto border border-neutral-800 bg-[#111111] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <h2 className="text-base font-semibold text-white">
                Edit profile
              </h2>

              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-neutral-500 transition hover:text-white"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-400">
                  Username
                </label>

                <input
                  value={`@${profile.username}`}
                  disabled
                  className="w-full border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-neutral-500 outline-none"
                />

                <p className="mt-1.5 text-xs text-neutral-600">
                  Username cannot be changed here.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-400">
                  Full name
                </label>

                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  maxLength={50}
                  className="w-full border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-400">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleFormChange}
                  maxLength={250}
                  rows={4}
                  className="w-full resize-none border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm leading-5 text-white outline-none transition focus:border-neutral-400"
                />

                <p className="mt-1 text-right text-xs text-neutral-600">
                  {form.bio.length}/250
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-400">
                  Website
                </label>

                <input
                  name="website"
                  value={form.website}
                  onChange={handleFormChange}
                  placeholder="https://example.com"
                  className="w-full border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-400">
                  Interests
                </label>

                <input
                  name="interests"
                  value={form.interests}
                  onChange={handleFormChange}
                  placeholder="React, Node.js, AI"
                  className="w-full border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-neutral-400"
                />

                <p className="mt-1 text-xs text-neutral-600">
                  Separate multiple interests with commas.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-400">
                  Productivity goals
                </label>

                <input
                  name="productivityGoals"
                  value={form.productivityGoals}
                  onChange={handleFormChange}
                  placeholder="Learn React, Build projects"
                  className="w-full border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-neutral-400"
                />

                <p className="mt-1 text-xs text-neutral-600">
                  Separate multiple goals with commas.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSavingProfile}
                  className="border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex min-w-[90px] items-center justify-center gap-2 bg-[#0095f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0086e0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-[640px]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute -right-2 -top-12 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-neutral-400 transition hover:text-white"
            >
              <X size={20} />
            </button>

            <PostCard post={selectedPost} />
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
