import { toast } from "sonner";

import AppToast from "./AppToast";

export const showSuccessToast = (title, description) => {
  toast.custom(
    (toastId) => (
      <AppToast
        toastId={toastId}
        title={title}
        description={description}
        type="success"
        toast={toast}
      />
    ),
    {
      duration: 4000,
    },
  );
};

export const showErrorToast = (title, description) => {
  toast.custom(
    (toastId) => (
      <AppToast
        toastId={toastId}
        title={title}
        description={description}
        type="error"
        toast={toast}
      />
    ),
    {
      duration: 4000,
    },
  );
};
