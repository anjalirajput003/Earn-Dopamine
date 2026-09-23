import { Check, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CreatePostModal from "../../components/feed/CreatePostModal";
import PostCard from "../../components/feed/PostCard";
import { fetchFeed } from "../../features/posts/postSlice";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// Must match MEDIA_HEIGHT in PostCard so the skeleton doesn't jump.
const MEDIA_HEIGHT = { height: "min(52vh, 420px)" };

/* -------------------------------------------------------------------------
   Composer: the main "create post" action, right at the top of the feed
------------------------------------------------------------------------- */

const Composer = ({ initial, onOpen }) => (
  <div className="mb-4 flex items-center gap-3 rounded-2xl border border-neutral-800 bg-[#111111] p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-white">
      {initial}
    </div>

    <button
      type="button"
      onClick={onOpen}
      className="min-w-0 flex-1 truncate rounded-full bg-neutral-900 px-4 py-2 text-left text-sm text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      What are you working on?
    </button>

    <button
      type="button"
      onClick={onOpen}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <Plus size={16} strokeWidth={2.4} />
      Post
    </button>
  </div>
);

/* -------------------------------------------------------------------------
   States
------------------------------------------------------------------------- */

const PostSkeleton = () => (
  <div className="mb-4 animate-pulse overflow-hidden rounded-2xl border border-neutral-800 bg-[#111111]">
    <div className="flex items-center gap-2.5 px-4 py-3">
      <div className="h-8 w-8 rounded-full bg-neutral-800" />
      <div className="h-3 w-28 rounded bg-neutral-800" />
    </div>

    <div className="w-full bg-neutral-900" style={MEDIA_HEIGHT} />

    <div className="flex gap-4 px-4 py-3.5">
      <div className="h-5 w-5 rounded-full bg-neutral-800" />
      <div className="h-5 w-5 rounded-full bg-neutral-800" />
      <div className="h-5 w-5 rounded-full bg-neutral-800" />
    </div>
  </div>
);

const FeedSkeleton = () => (
  <div role="status" aria-label="Loading your feed">
    <PostSkeleton />
    <PostSkeleton />
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="mb-4 rounded-2xl border border-neutral-800 bg-[#111111] px-6 py-10 text-center">
    <p className="text-sm text-red-400">{message}</p>

    <button
      type="button"
      onClick={onRetry}
      className="mt-4 rounded-full bg-neutral-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
    >
      Try again
    </button>
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div className="rounded-2xl border border-neutral-800 bg-[#111111] px-6 py-16 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900">
      <Plus size={24} className="text-neutral-400" />
    </div>

    <h2 className="mt-5 text-lg font-semibold text-white">Nothing here yet</h2>

    <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-neutral-500">
      Share what you're working on and start building your productive
      community.
    </p>

    <button
      type="button"
      onClick={onCreate}
      className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
    >
      Create your first post
    </button>
  </div>
);

// The feed has an end on purpose: this app is about progress, not scrolling.
const CaughtUp = () => (
  <div className="flex flex-col items-center px-6 pb-12 pt-4 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 text-neutral-400">
      <Check size={20} strokeWidth={2} />
    </div>

    <p className="mt-4 text-sm font-medium text-neutral-300">
      You're all caught up
    </p>
    <p className="mt-1 text-sm text-neutral-500">
      That's everything for now. Go get something done.
    </p>
  </div>
);

/* -------------------------------------------------------------------------
   Page
------------------------------------------------------------------------- */

const Home = () => {
  const dispatch = useDispatch();

  const [showCreatePost, setShowCreatePost] = useState(false);

  const { posts, isLoading, error } = useSelector((state) => state.posts);

  // Adjust this selector if your auth slice is named differently.
  const user = useSelector((state) => state.auth?.user);
  const name = user?.username || user?.name || "";
  const initial = (name || "?").charAt(0).toUpperCase();

  const load = useCallback(() => dispatch(fetchFeed()), [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const hasPosts = posts.length > 0;

  // Only show the skeleton on first load, so a refetch doesn't blank the feed.
  const showSkeleton = isLoading && !hasPosts;
  const showError = Boolean(error) && !isLoading;
  const showEmpty = !isLoading && !error && !hasPosts;

  return (
    <>
      <div className="mx-auto w-full max-w-[560px] px-4 pb-4 sm:px-0">
        {/* Header */}

        <header className="flex flex-wrap items-baseline gap-x-2 py-5">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {getGreeting()}
            {name && `, ${name}`}
          </h1>

          <p className="text-sm text-neutral-500">
            Focus on progress, not endless scrolling.
          </p>
        </header>

        {/* Composer */}

        <Composer initial={initial} onOpen={() => setShowCreatePost(true)} />

        {/* States */}

        {showSkeleton && <FeedSkeleton />}
        {showError && <ErrorState message={error} onRetry={load} />}
        {showEmpty && <EmptyState onCreate={() => setShowCreatePost(true)} />}

        {/* Feed */}

        {hasPosts && (
          <>
            <div>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {!isLoading && !error && <CaughtUp />}
          </>
        )}
      </div>

      {/* Modal */}

      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </>
  );
};

export default Home;
