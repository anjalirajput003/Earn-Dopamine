import { Outlet } from "react-router-dom";

import useAuthInitialize from "../../hooks/useAuthInitialize";

const AuthInitializer = () => {
  useAuthInitialize();

  return <Outlet />;
};

export default AuthInitializer;
