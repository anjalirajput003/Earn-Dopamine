import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { store } from "./app/store";
import router from "./app/router";
import SocketProvider from "./components/common/SocketProvider";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>

      <Toaster position="top-right" theme="dark" visibleToasts={4} />
    </Provider>
  </StrictMode>,
);
