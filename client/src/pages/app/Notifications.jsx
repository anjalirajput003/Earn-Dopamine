import { CheckCheck, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchNotifications,
  readAllNotifications,
  readNotification,
} from "../../features/notifications/notificationSlice";

const Notifications = () => {
  const dispatch = useDispatch();

  const {
    notifications,
    unreadCount,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    isUpdating,
    error,
  } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(readNotification(notification._id));
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;

    dispatch(
      fetchNotifications({
        page: page + 1,
        limit: 10,
      }),
    );
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0 || isUpdating) return;

    dispatch(readAllNotifications());
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[680px] px-4 pb-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="animate-spin text-neutral-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[680px] px-4 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Notifications</h1>

          <p className="mt-1 text-sm text-neutral-500">
            Stay updated with your activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={isUpdating}
            className="flex items-center gap-2 text-sm font-medium text-[#0095f6] transition hover:text-[#38aaff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCheck size={16} />
            )}
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900">
            <CheckCheck size={20} className="text-neutral-600" />
          </div>

          <h2 className="text-sm font-medium text-white">
            No notifications yet
          </h2>

          <p className="mt-1 text-sm text-neutral-600">You're all caught up.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-[#0d0d0d]">
          {notifications.map((notification) => {
            const actorName =
              notification.actor?.fullName ||
              notification.actor?.username ||
              "Someone";

            const avatar = notification.actor?.avatar;

            return (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`flex w-full items-start gap-3 border-b border-neutral-800 px-4 py-4 text-left transition last:border-b-0 hover:bg-neutral-900/60 ${
                  !notification.isRead ? "bg-neutral-900/40" : "bg-transparent"
                }`}
              >
                <div className="shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={actorName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-white">
                      {actorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 text-neutral-300">
                    <span className="font-semibold text-white">
                      {actorName}
                    </span>{" "}
                    {notification.message}
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {!notification.isRead && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0095f6]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {hasMore && notifications.length > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore && <Loader2 size={15} className="animate-spin" />}

            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </main>
  );
};

export default Notifications;
