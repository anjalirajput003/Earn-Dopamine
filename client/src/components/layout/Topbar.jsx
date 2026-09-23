import { Bell, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchUnreadNotificationCount } from "../../features/notifications/notificationSlice";

import {
  clearSearchResults,
  searchProfileUsers,
} from "../../features/profile/profileSlice";

const Topbar = ({ sidebarCollapsed }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  const { searchResults, isSearching } = useSelector((state) => state.profile);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sidebarWidth = sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[240px]";

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUnreadNotificationCount());
    }
  }, [dispatch, user?._id]);

  // Debounced user search
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      dispatch(clearSearchResults());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(
        searchProfileUsers({
          q: query,
          page: 1,
          limit: 10,
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleProfileClick = () => {
    if (!user?.username) return;

    navigate(`/profile/${user.username}`);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setIsSearchFocused(true);
  };

  const handleUserClick = (username) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    dispatch(clearSearchResults());

    navigate(`/profile/${username}`);
  };

  const showSearchResults = isSearchFocused && searchQuery.trim().length > 0;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-20 h-16 border-b border-neutral-800 bg-[#0a0a0a]/95 backdrop-blur transition-all duration-300 ${sidebarWidth}`}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Search */}
        <div
          ref={searchRef}
          className="relative hidden w-full max-w-[360px] sm:block"
        >
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim()) {
                setIsSearchFocused(true);
              }
            }}
            placeholder="Search"
            className="h-10 w-full rounded-lg border border-neutral-800 bg-[#111111] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-700"
          />

          {showSearchResults && (
            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-lg border border-neutral-800 bg-[#111111] shadow-2xl">
              {isSearching ? (
                <div className="px-4 py-5 text-center text-sm text-neutral-500">
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-5 text-center text-sm text-neutral-500">
                  No users found
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto py-1">
                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      type="button"
                      onClick={() => handleUserClick(result.username)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-900"
                    >
                      {/* Avatar */}
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-800">
                        {result.avatar?.url ? (
                          <img
                            src={result.avatar.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                            {result.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>

                      {/* User information */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {result.username}
                        </p>

                        {result.fullName && (
                          <p className="truncate text-xs text-neutral-500">
                            {result.fullName}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative text-neutral-500 transition hover:text-white"
          >
            <Bell size={20} strokeWidth={1.8} />

            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#0095f6] px-1 text-[9px] font-bold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-neutral-900"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-sm font-semibold text-white">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.username?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">
                {user?.username || "User"}
              </p>

              <p className="text-[11px] text-neutral-600">Productive mode</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
