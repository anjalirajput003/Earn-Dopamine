import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

const AppToast = ({ toastId, type = "success", title, description, toast }) => {
  const [progress, setProgress] = useState(100);

  const duration = 4000;

  useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);

      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const isSuccess = type === "success";

  return (
    <div className="relative w-90 overflow-hidden rounded-xl border border-neutral-800 bg-[#151515] p-4 shadow-2xl shadow-black/50">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 ${
            isSuccess ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{title}</p>

          {description && (
            <p className="mt-1 text-xs leading-5 text-neutral-400">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(toastId)}
          className="text-neutral-500 transition hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-neutral-800">
        <div
          className={`h-full transition-[width] duration-75 ${
            isSuccess ? "bg-emerald-400" : "bg-red-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default AppToast;
