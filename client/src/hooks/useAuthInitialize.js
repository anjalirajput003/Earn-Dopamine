import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { initializeAuth } from "../features/auth/authSlice";

const useAuthInitialize = () => {
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    dispatch(initializeAuth());
  }, [dispatch]);
};

export default useAuthInitialize;
