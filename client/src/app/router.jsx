import { createBrowserRouter } from "react-router-dom";

import AuthInitializer from "../components/common/AuthInitializer";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import PublicRoute from "../components/common/PublicRoute";

import Home from "../pages/app/Home";
import Notifications from "../pages/app/Notifications";
import Profile from "../pages/app/Profile";
import Saved from "../pages/app/Saved";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Goals from "../pages/app/Goals";
import Milestones from "../pages/app/Milestones";
import Focus from "../pages/app/Focus";
import FocusRoom from "../pages/app/FocusRoom";
import Explore from "../pages/app/Explore";
import Study from "../pages/app/Study";
import Messages from "../pages/app/Messages";
import Community from "../pages/app/Community";

const router = createBrowserRouter([
  {
    element: <AuthInitializer />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/register",
            element: <Register />,
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: "/",
                element: <Home />,
              },
              {
                path: "/saved",
                element: <Saved />,
              },
              {
                path: "/notifications",
                element: <Notifications />,
              },
              {
                path: "/profile/:username",
                element: <Profile />,
              },
              {
                path: "/goals",
                element: <Goals />,
              },
              {
                path: "/milestones",
                element: <Milestones />,
              },
              {
                path: "/focus",
                element: <Focus />,
              },
              {
                path: "/focus/room/:roomId",
                element: <FocusRoom />,
              },
              {
                path: "/explore",
                element: <Explore />,
              },
              {
                path: "/study",
                element: <Study />,
              },
              {
                path: "/messages",
                element: <Messages />,
              },
              {
                path: "/community",
                element: <Community />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
