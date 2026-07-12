import { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

import {
  login as loginAPI,
} from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const location = useLocation();

  const { login } = useAuth();

  const from =
    location.state?.from?.pathname ||
    "/dashboard";

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      setError("");

      const token =
        await loginAPI({
          email,
          password,
        });

      await login(
        token.access_token
      );

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold text-blue-600">
            SelfStack
          </h1>

          <p className="mt-2 text-gray-500">
            AI Retail Supply Chain
            Management
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="mb-2 block font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
              required
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                className="w-full rounded-lg border p-3 pr-12 focus:border-blue-500 focus:outline-none"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-3"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2">

              <input type="checkbox" />

              Remember Me

            </label>

            <button
              type="button"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >

            <LogIn size={18} />

            {loading
              ? "Logging In..."
              : "Login"}

          </button>

        </form>

        <div className="mt-6 border-t pt-4 text-center">

          <p className="text-gray-600">
            Don't have an account?
          </p>

          <Link
            to="/register"
            className="mt-2 inline-block font-semibold text-blue-600 hover:underline"
          >
            Create a New Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;