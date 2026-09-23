import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  MessageCircle,
  Play,
  Quote,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";

import PostCard from "../../components/feed/PostCard";
import { fetchSavedPosts } from "../../features/posts/postSlice";

/* -------------------------------------------------------------------------
   Styling
   - `styles` holds layout-critical rules inline, so the grid, width cap,
     tile ratio and modal work even if Tailwind hasn't generated a class.
   - `css` is a small plain-CSS block for things inline styles can't do
     (hover, focus-visible, keyframes, media queries). It doesn't depend on
     Tailwind either, and it replaces the per-tile hover state in React.
------------------------------------------------------------------------- */

const styles = {
  page: { width: "100%", maxWidth: 935, margin: "0 auto", padding: "0 4px 40px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  tile: {
    position: "relative",
    display: "block",
    width: "100%",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    border: 0,
    padding: 0,
    cursor: "pointer",
  },
  cover: { display: "block", width: "100%", height: "100%", objectFit: "cover" },
  textTile: {
    position: "relative",
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding: 24,
  },
  textQuote: {
    position: "absolute",
    top: 14,
    left: 14,
    color: "#fff",
    opacity: 0.3,
  },
  textClamp: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 6,
    overflow: "hidden",
    color: "#fff",
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.4,
    textAlign: "center",
    wordBreak: "break-word",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    color: "#fff",
    display: "flex",
    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.7))",
  },
  hoverOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    pointerEvents: "none",
  },
  stat: { display: "flex", alignItems: "center", gap: 6 },
  filters: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: 0,
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    overflowY: "auto",
    overscrollBehavior: "contain",
    background: "rgba(0,0,0,0.85)",
    outline: "none",
  },
  overlayInner: {
    display: "flex",
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding: "64px 16px",
  },
  modalCard: { width: "100%", maxWidth: 680 },
  roundBtn: {
    position: "fixed",
    display: "flex",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    borderRadius: 999,
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    cursor: "pointer",
  },
  counter: {
    position: "fixed",
    top: 24,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "4px 12px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.55)",
    color: "#e5e5e5",
    fontSize: 13,
    fontWeight: 500,
    pointerEvents: "none",
  },
};

const css = `
.sv-grid { gap: 4px; }
@media (max-width: 640px) { .sv-grid { gap: 2px; } }

.sv-tile { background: #171717; }
.sv-tile.sv-loading {
  background: linear-gradient(90deg, #171717 25%, #242424 50%, #171717 75%);
  background-size: 200% 100%;
  animation: sv-shimmer 1.4s linear infinite;
}
.sv-tile .sv-cover { transition: opacity 300ms ease, transform 300ms ease; }
.sv-tile:hover .sv-cover { transform: scale(1.03); }
.sv-tile .sv-overlay { opacity: 0; transition: opacity 150ms ease; }
.sv-tile:hover .sv-overlay,
.sv-tile:focus-visible .sv-overlay { opacity: 1; }
.sv-tile:focus-visible { outline: 2px solid #fff; outline-offset: -3px; }

.sv-skeleton {
  aspect-ratio: 1 / 1;
  background: linear-gradient(90deg, #171717 25%, #242424 50%, #171717 75%);
  background-size: 200% 100%;
  animation: sv-shimmer 1.4s linear infinite;
}
@keyframes sv-shimmer { to { background-position: -200% 0; } }

.sv-chip { transition: background 150ms ease, color 150ms ease; }
.sv-chip:focus-visible,
.sv-round:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.sv-round:hover { background: rgba(0,0,0,0.8); }

@media (prefers-reduced-motion: reduce) {
  .sv-tile .sv-cover, .sv-tile .sv-overlay, .sv-chip { transition: none; }
  .sv-tile:hover .sv-cover { transform: none; }
  .sv-tile.sv-loading, .sv-skeleton { animation: none; }
}
`;

/* -------------------------------------------------------------------------
   Post helpers (change field names here if your posts use different ones)
------------------------------------------------------------------------- */

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;
const looksLikeMedia = (url) =>
  IMAGE_EXT.test(url) || VIDEO_EXT.test(url) || /cloudinary|\/uploads?\//i.test(url);

const MEDIA_KEYS = [
  "media",
  "images",
  "mediaUrls",
  "photos",
  "attachments",
  "files",
  "image",
  "imageUrl",
  "photo",
  "thumbnail",
];
const SKIP_KEYS = /author|user|avatar|profile/i;

const toMedia = (item) => {
  if (!item) return null;

  const url =
    typeof item === "string"
      ? item
      : item.url || item.secure_url || item.src || item.path;
  if (!url || typeof url !== "string") return null;

  const type =
    typeof item === "object"
      ? String(item.type || item.resource_type || item.mimeType || "")
      : "";

  return { url, isVideo: type.startsWith("video") || VIDEO_EXT.test(url) };
};

// Known media fields first, then any other field that holds an image/video URL.
const getMedia = (post) => {
  if (!post) return [];

  const keys = [
    ...MEDIA_KEYS,
    ...Object.keys(post).filter(
      (key) => !MEDIA_KEYS.includes(key) && !SKIP_KEYS.test(key),
    ),
  ];

  for (const key of keys) {
    const value = post[key];
    if (!value) continue;

    const known = MEDIA_KEYS.includes(key);
    const list = (Array.isArray(value) ? value : [value])
      .map(toMedia)
      .filter((item) => item && (known || looksLikeMedia(item.url)));

    if (list.length) return list;
  }

  return [];
};

const countOf = (value) => (Array.isArray(value) ? value.length : Number(value) || 0);

const getCaption = (post) => post?.caption ?? post?.content ?? post?.text ?? "";
const getCheers = (post) => countOf(post?.likes ?? post?.likesCount);
const getComments = (post) => countOf(post?.comments ?? post?.commentsCount);

const kindOf = (media) => {
  if (!media.length) return "text";
  return media[0].isVideo ? "video" : "photo";
};

// Text-only posts get a stable coloured tile, so the grid isn't a wall of grey.
const GRADIENTS = [
  ["#312e81", "#7c3aed"],
  ["#0c4a6e", "#0d9488"],
  ["#14532d", "#0d9488"],
  ["#7c2d12", "#be185d"],
  ["#581c87", "#db2777"],
  ["#1e3a8a", "#0891b2"],
];

const gradientFor = (post) => {
  const seed = String(post?._id ?? "");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "photo", label: "Photos" },
  { id: "video", label: "Videos" },
  { id: "text", label: "Text" },
];

/* -------------------------------------------------------------------------
   Grid tile
------------------------------------------------------------------------- */

const PostTile = ({ post, media, onOpen }) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const cover = failed ? null : media[0];
  const isCarousel = media.length > 1;
  const caption = getCaption(post);
  const label = caption
    ? `Open saved post: ${caption.slice(0, 80)}`
    : "Open saved post";

  const coverStyle = { ...styles.cover, opacity: loaded ? 1 : 0 };

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className={`sv-tile${cover && !loaded ? " sv-loading" : ""}`}
      style={styles.tile}
    >
      {cover ? (
        cover.isVideo ? (
          <video
            className="sv-cover"
            src={`${cover.url}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            onLoadedData={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={coverStyle}
          />
        ) : (
          <img
            className="sv-cover"
            src={cover.url}
            alt=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={coverStyle}
          />
        )
      ) : (
        <span style={{ ...styles.textTile, background: gradientFor(post) }}>
          <Quote size={22} strokeWidth={2} style={styles.textQuote} aria-hidden="true" />
          <span style={styles.textClamp}>{caption || "Post"}</span>
        </span>
      )}

      {(isCarousel || cover?.isVideo) && (
        <span style={styles.badge}>
          {isCarousel ? (
            <Copy size={18} strokeWidth={2.2} />
          ) : (
            <Play size={18} fill="currentColor" strokeWidth={0} />
          )}
        </span>
      )}

      <span className="sv-overlay" style={styles.hoverOverlay}>
        <span style={styles.stat}>
          <Heart size={18} fill="currentColor" strokeWidth={0} />
          {getCheers(post)}
        </span>
        <span style={styles.stat}>
          <MessageCircle size={18} fill="currentColor" strokeWidth={0} />
          {getComments(post)}
        </span>
      </span>
    </button>
  );
};

/* -------------------------------------------------------------------------
   Filter chips (only shown when the saved posts are a mix of kinds)
------------------------------------------------------------------------- */

const FilterChips = ({ counts, active, onChange }) => (
  <div style={styles.filters} role="group" aria-label="Filter saved posts">
    {FILTERS.filter(({ id }) => id === "all" || counts[id] > 0).map(
      ({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            className="sv-chip"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            style={{
              ...styles.chip,
              background: isActive ? "#fafafa" : "#171717",
              color: isActive ? "#0a0a0a" : "#a3a3a3",
            }}
          >
            {label}
            <span style={{ opacity: 0.6 }}>{counts[id]}</span>
          </button>
        );
      },
    )}
  </div>
);

/* -------------------------------------------------------------------------
   States
------------------------------------------------------------------------- */

const GridSkeleton = () => (
  <div className="sv-grid" style={styles.grid} aria-hidden="true">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="sv-skeleton" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="px-6 py-20 text-center">
    <div
      className="mx-auto flex items-center justify-center rounded-full"
      style={{ width: 64, height: 64, border: "2px solid #404040" }}
    >
      <Bookmark size={28} strokeWidth={1.6} className="text-neutral-300" />
    </div>

    <h2 className="mt-5 text-xl font-semibold text-white">Nothing saved yet</h2>

    <p
      className="mx-auto mt-2 text-sm leading-6 text-neutral-500"
      style={{ maxWidth: 320 }}
    >
      Tap the bookmark on any post to keep it here. Only you can see what
      you've saved.
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="px-6 py-20 text-center">
    <p className="text-sm text-red-400">{message}</p>

    <button
      type="button"
      onClick={onRetry}
      className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
      style={{ background: "#262626", border: 0, cursor: "pointer" }}
    >
      Try again
    </button>
  </div>
);

/* -------------------------------------------------------------------------
   Post modal (opens the full PostCard so cheers, comments and unsave work)
------------------------------------------------------------------------- */

const DESKTOP_QUERY = "(min-width: 900px)";

const useIsDesktop = () => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return matches;
};

const PostModal = ({
  post,
  index,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}) => {
  const isDesktop = useIsDesktop();
  const dialogRef = useRef(null);

  // Move focus into the dialog on open and hand it back to the tile on close.
  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Saved post"
      style={styles.overlay}
    >
      <div
        style={styles.overlayInner}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={styles.modalCard}>
          <PostCard key={post._id} post={post} />
        </div>
      </div>

      {total > 1 && (
        <span style={styles.counter} aria-live="polite">
          {index + 1} / {total}
        </span>
      )}

      <button
        type="button"
        className="sv-round"
        onClick={onClose}
        aria-label="Close"
        style={{ ...styles.roundBtn, top: 16, right: 16 }}
      >
        <X size={22} />
      </button>

      {isDesktop && hasPrev && (
        <button
          type="button"
          className="sv-round"
          onClick={onPrev}
          aria-label="Previous saved post"
          style={{ ...styles.roundBtn, left: 16, top: "50%", transform: "translateY(-50%)" }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {isDesktop && hasNext && (
        <button
          type="button"
          className="sv-round"
          onClick={onNext}
          aria-label="Next saved post"
          style={{ ...styles.roundBtn, right: 16, top: "50%", transform: "translateY(-50%)" }}
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>,
    document.body,
  );
};

/* -------------------------------------------------------------------------
   Page
------------------------------------------------------------------------- */

const Saved = () => {
  const dispatch = useDispatch();

  const { savedPosts, isSavedLoading, savedError } = useSelector(
    (state) => state.posts,
  );

  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");

  // Work out media + kind once per fetch instead of on every render.
  const items = useMemo(
    () =>
      savedPosts.map((post) => {
        const media = getMedia(post);
        return { post, media, kind: kindOf(media) };
      }),
    [savedPosts],
  );

  const counts = useMemo(() => {
    const totals = { all: items.length, photo: 0, video: 0, text: 0 };
    items.forEach(({ kind }) => {
      totals[kind] += 1;
    });
    return totals;
  }, [items]);

  const kindsPresent = ["photo", "video", "text"].filter((k) => counts[k] > 0);
  const showFilters = kindsPresent.length > 1;

  // Falls back to "All" if the chosen kind no longer has any posts.
  const activeFilter = showFilters && counts[filter] > 0 ? filter : "all";
  const visible = useMemo(
    () =>
      activeFilter === "all"
        ? items
        : items.filter(({ kind }) => kind === activeFilter),
    [items, activeFilter],
  );

  const selectedIndex = selectedId
    ? visible.findIndex(({ post }) => post._id === selectedId)
    : -1;
  const selectedPost = selectedIndex >= 0 ? visible[selectedIndex].post : null;
  const isOpen = Boolean(selectedPost);

  const load = useCallback(() => dispatch(fetchSavedPosts()), [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const close = useCallback(() => setSelectedId(null), []);

  const goTo = useCallback(
    (offset) => {
      const next = visible[selectedIndex + offset];
      if (next) setSelectedId(next.post._id);
    },
    [visible, selectedIndex],
  );

  // If the open post disappears (e.g. it was unsaved), drop the selection.
  useEffect(() => {
    if (selectedId && selectedIndex === -1) setSelectedId(null);
  }, [selectedId, selectedIndex]);

  // Escape closes, arrows navigate, background scroll is locked while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") return close();

      const isTyping = e.target?.closest?.(
        "input, textarea, [contenteditable='true']",
      );
      if (isTyping) return undefined;

      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
      return undefined;
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, goTo]);

  const hasPosts = items.length > 0;
  const showSkeleton = isSavedLoading && !hasPosts;
  const showError = Boolean(savedError) && !hasPosts && !isSavedLoading;
  const showEmpty = !isSavedLoading && !savedError && !hasPosts;

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Saved</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Only you can see what you've saved
          </p>
        </div>

        {hasPosts && (
          <span className="text-sm text-neutral-500">
            {items.length} {items.length === 1 ? "post" : "posts"}
          </span>
        )}
      </header>

      {showSkeleton && <GridSkeleton />}
      {showError && <ErrorState message={savedError} onRetry={load} />}
      {showEmpty && <EmptyState />}

      {hasPosts && showFilters && (
        <FilterChips counts={counts} active={activeFilter} onChange={setFilter} />
      )}

      {hasPosts && (
        <div className="sv-grid" style={styles.grid}>
          {visible.map(({ post, media }) => (
            <PostTile
              key={post._id}
              post={post}
              media={media}
              onOpen={() => setSelectedId(post._id)}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          index={selectedIndex}
          total={visible.length}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < visible.length - 1}
          onPrev={() => goTo(-1)}
          onNext={() => goTo(1)}
          onClose={close}
        />
      )}
    </div>
  );
};

export default Saved;
