import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  HandHelping,
  Inbox,
  Send,
  MessageCircle,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  completeHelp,
  getReceivedHelp,
  getSentHelp,
  respondToHelp,
} from "../../services/api/helpApi";

const statusStyles = {
  pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  accepted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  declined: "border-red-500/20 bg-red-500/10 text-red-400",
  completed: "border-purple-500/20 bg-purple-500/10 text-purple-400",
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Avatar = ({ user, size = "h-11 w-11" }) => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username || "User"}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-semibold text-purple-300`}
    >
      {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
      statusStyles[status] ||
      "border-neutral-700 bg-neutral-800 text-neutral-300"
    }`}
  >
    {status}
  </span>
);

const Community = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadHelp = async () => {
    setLoading(true);

    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        getReceivedHelp(),
        getSentHelp(),
      ]);

      setReceived(receivedResponse.data?.data?.helpOffers || []);
      setSent(sentResponse.data?.data?.helpOffers || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load community activity.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHelp();
  }, []);

  const activeOffers = useMemo(
    () => (activeTab === "received" ? received : sent),
    [activeTab, received, sent],
  );

  const handleRespond = async (helpId, status) => {
    setActionId(helpId);

    try {
      const response = await respondToHelp(helpId, status);
      const updatedHelp = response.data;

      setReceived((prev) =>
        prev.map((help) =>
          help._id === helpId ? { ...help, ...updatedHelp } : help,
        ),
      );

      toast.success(
        status === "accepted" ? "Help offer accepted." : "Help offer declined.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to respond to help offer.",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleComplete = async (helpId) => {
    setActionId(helpId);

    try {
      const response = await completeHelp(helpId);
      const updatedHelp = response.data;

      setReceived((prev) =>
        prev.map((help) =>
          help._id === helpId ? { ...help, ...updatedHelp } : help,
        ),
      );

      toast.success("Help marked as completed.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to complete help offer.",
      );
    } finally {
      setActionId(null);
    }
  };

  const getDisplayUser = (help) =>
    activeTab === "received" ? help.offerer : help.receiver;

  return (
    <div className="min-h-full bg-[#0a0a0a] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <HandHelping size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">Community</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Help others, receive help, and collaborate.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-medium transition ${
              activeTab === "received"
                ? "border-purple-500 text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Inbox size={17} />
            Received
            {received.length > 0 && (
              <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-xs text-purple-300">
                {received.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-medium transition ${
              activeTab === "sent"
                ? "border-purple-500 text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Send size={17} />
            Sent
            {sent.length > 0 && (
              <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-xs text-purple-300">
                {sent.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-purple-500" />
          </div>
        ) : activeOffers.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center border border-neutral-800 bg-[#0d0d0d] px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              {activeTab === "received" ? (
                <Inbox size={25} />
              ) : (
                <Send size={25} />
              )}
            </div>

            <h2 className="text-lg font-semibold">
              {activeTab === "received"
                ? "No help offers yet"
                : "No help offers sent"}
            </h2>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
              {activeTab === "received"
                ? "When someone offers to help with one of your posts, it will appear here."
                : "Offer help on another user's post and your collaboration will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOffers.map((help) => {
              const user = getDisplayUser(help);
              const isPending = help.status === "pending";
              const isAccepted = help.status === "accepted";
              const isActionLoading = actionId === help._id;

              return (
                <article
                  key={help._id}
                  className="border border-neutral-800 bg-[#0d0d0d] p-5 transition hover:border-neutral-700"
                >
                  {/* User + status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar user={user} />

                      <div className="min-w-0">
                        <Link
                          to={`/profile/${user?.username}`}
                          className="block truncate text-sm font-semibold hover:text-purple-400"
                        >
                          {user?.fullName || user?.username || "User"}
                        </Link>

                        {user?.username && (
                          <p className="truncate text-xs text-neutral-500">
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={help.status} />
                  </div>

                  {/* Message */}
                  {help.message && (
                    <div className="mt-5 border-l-2 border-purple-500/40 pl-4">
                      <p className="text-sm leading-6 text-neutral-300">
                        {help.message}
                      </p>
                    </div>
                  )}

                  {/* Post */}
                  {help.post && (
                    <div className="mt-5 border border-neutral-800 bg-[#111111] px-4 py-3">
                      <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">
                        Related post
                      </p>

                      <p className="line-clamp-2 text-sm text-neutral-400">
                        {help.post.caption || "Post"}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-5 flex flex-col gap-4 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <Clock3 size={14} />
                      {formatDate(help.createdAt)}
                    </div>

                    {/* Received actions */}
                    {activeTab === "received" && isPending && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleRespond(help._id, "declined")}
                          className="flex items-center gap-2 border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={15} />
                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleRespond(help._id, "accepted")}
                          className="flex items-center gap-2 bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={15} />
                          Accept
                        </button>
                      </div>
                    )}

                    {activeTab === "received" && isAccepted && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleComplete(help._id)}
                        className="flex items-center gap-2 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={15} />
                        Mark Completed
                      </button>
                    )}

                    {activeTab === "sent" && isAccepted && user?._id && (
                      <button
                        type="button"
                        onClick={() => navigate(`/messages?userId=${user._id}`)}
                        className="flex items-center gap-2 bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
                      >
                        <MessageCircle size={15} />
                        Message
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Current user context */}
        {currentUser && (
          <p className="mt-6 text-center text-xs text-neutral-700">
            Community activity for @{currentUser.username}
          </p>
        )}
      </div>
    </div>
  );
};

export default Community;
