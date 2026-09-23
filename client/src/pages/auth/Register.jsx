import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../../features/auth/authSlice";
import { toast } from "sonner";
import {
  showErrorToast,
  showSuccessToast,
} from "../../components/common/toast";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
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
      await dispatch(register(formData)).unwrap();

      showSuccessToast(
        "Account created successfully",
        "Welcome to Earn Dopamine.",
      );

      navigate("/login");
    } catch (error) {
      showErrorToast("Registration failed", error || "Something went wrong.");
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

            <p className="mt-2 text-sm text-neutral-500">
              Create your account and start building.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 py-3 text-sm text-white placeholder:text-neutral-600 outline-none transition focus:border-neutral-600"
            />

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 py-3 text-sm text-white placeholder:text-neutral-600 outline-none transition focus:border-neutral-600"
            />

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
              autoComplete="new-password"
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
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </section>

        <section className="mt-3 border border-neutral-800 bg-[#111111] px-6 py-5 text-center text-sm">
          <span className="text-neutral-400">Already have an account? </span>

          <Link
            to="/login"
            className="font-semibold text-[#0095f6] hover:text-[#38a9f9]"
          >
            Log in
          </Link>
        </section>

        <p className="mt-5 text-center text-xs text-neutral-600">
          Focus on progress, not endless scrolling.
        </p>
      </div>
    </main>
  );
};

export default Register;
