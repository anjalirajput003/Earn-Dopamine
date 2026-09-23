import {
  BarChart3,
  Bookmark,
  ChevronLeft,
  Compass,
  Flame,
  Goal,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import { logout } from "../../features/auth/authSlice";

const navItems = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Explore",
    path: "/explore",
    icon: Compass,
  },
  {
    label: "Goals",
    path: "/goals",
    icon: Goal,
  },
  {
    label: "Focus",
    path: "/focus",
    icon: Flame,
  },
  {
    label: "Study",
    path: "/study",
    icon: BarChart3,
  },
  {
    label: "Messages",
    path: "/messages",
    icon: MessageCircle,
  },
  {
    label: "Community",
    path: "/community",
    icon: Users,
  },
  {
    label: "Saved",
    path: "/saved",
    icon: Bookmark,
  },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    const result = await dispatch(logout());

    if (logout.fulfilled.match(result)) {
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-screen border-r border-neutral-800 bg-[#0a0a0a] px-3 py-6 transition-all duration-300 lg:block ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between px-2"
          }`}
        >
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Earn Dopamine
              </h1>

              <p className="mt-1 text-xs text-neutral-600">
                Focus. Build. Grow.
              </p>
            </div>
          )}

          {collapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-lg">
              ⚡
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-800 bg-[#111111] text-neutral-500 transition hover:text-white"
        >
          <ChevronLeft
            size={14}
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg py-3 text-sm font-medium transition ${
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  } ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-900/60 hover:text-white"
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.8} />

                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3 space-y-1">
          {/* <NavLink
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg py-3 text-sm font-medium transition ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:bg-neutral-900/60 hover:text-white"
              }`
            }
          >
            <Settings size={19} strokeWidth={1.8} />

            {!collapsed && <span>Settings</span>}
          </NavLink> */}

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoading}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center rounded-lg py-3 text-sm font-medium text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          >
            <LogOut size={19} strokeWidth={1.8} />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-neutral-800 bg-[#111111] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              Logout from Earn Dopamine?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              You will need to log in again to access your account.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-neutral-400 transition hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center gap-2 bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
