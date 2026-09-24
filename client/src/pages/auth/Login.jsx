import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../../features/auth/authSlice";
import { toast } from "sonner";
import {
  showErrorToast,
  showSuccessToast,
} from "../../components/common/Toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(login(formData)).unwrap();

      showSuccessToast("Welcome back!", "You're successfully logged in.");

      navigate("/");
    } catch (error) {
      showErrorToast("Login failed", error || "Invalid credentials.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <div className="w-full max-w-95">
        <section className="border border-neutral-800 bg-[#111111] px-8 pb-8 pt-10 shadow-2xl shadow-black/30 sm:px-10">
          <div className="mb-9 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Earn Dopamine
            </h1>

            <p className="mt-2 text-sm text-neutral-500">Build. Focus. Grow.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 py-3 text-sm text-white placeholder:text-neutral-600 outline-none transition focus:border-neutral-600"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 py-3 text-sm text-white placeholder:text-neutral-600 outline-none transition focus:border-neutral-600"
            />

            {error && (
              <p className="pt-1 text-center text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-lg bg-[#0095f6] py-3 text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-800" />

            <span className="text-xs font-semibold text-neutral-600">OR</span>

            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          <button
            type="button"
            className="w-full text-center text-xs text-neutral-400 transition hover:text-white"
          >
            Forgot password?
          </button>
        </section>

        <section className="mt-3 border border-neutral-800 bg-[#111111] px-6 py-5 text-center text-sm">
          <span className="text-neutral-400">Don't have an account? </span>

          <Link
            to="/register"
            className="font-semibold text-[#0095f6] hover:text-[#38a9f9]"
          >
            Sign up
          </Link>
        </section>

        <p className="mt-5 text-center text-xs text-neutral-600">
          Focus on progress, not endless scrolling.
        </p>
      </div>
    </main>
  );
};

export default Login;
