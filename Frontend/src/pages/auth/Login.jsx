import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { loginApi } from "../../api/authApi";
import useAuthStore from "../../store/authStore";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await loginApi(data);

      login(res.user);

      toast.success(`Welcome back ${res.user.userName}`);

      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090207] text-white overflow-hidden relative">

      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-[#022003] blur-[120px] rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-green-600/10 blur-[120px] rounded-full" />

      {/* <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      /> */}

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">

        <div className="hidden lg:flex flex-col justify-center px-24">

          <div>

            <h1 className="font-array text-[9rem]  leading-none tracking-tight">
              MATRIX
            </h1>

            <div className="w-32 h-[2px] bg-gradient-to-r from-green-400 to-green-800 mt-6 mb-8" />

          </div>
        </div>

        <div className="font-clash flex items-center justify-center px-6">

          <div className="w-full max-w-md">

            <div className="lg:hidden mb-10">
              <h1 className="text-5xl font-array">
                MATRIX
              </h1>

              <p className="text-zinc-500 mt-3">
                Sign in to continue
              </p>
            </div>

            <div className="bg-green/3 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

              <div className="mb-8">

                <h2 className="text-3xl font-bold tracking-tight">
                  Welcome back
                </h2>

                <p className="text-zinc-500 mt-2 text-sm">
                  Enter your credentials to continue
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div>

                  <label className="text-sm text-zinc-400 block mb-2">
                    Username
                  </label>

                  <input
                    type="text"
                    placeholder="Enter username"
                    {...register("userName", {
                      required: "Username is required",
                    })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-green-400/50 focus:bg-green-400/[0.03] transition-all outline-none rounded-2xl px-4 py-3 text-sm"
                  />

                  {errors.userName && (
                    <p className="text-red-400 text-xs mt-2">
                      {errors.userName.message}
                    </p>
                  )}
                </div>

                <div>

                  <label className="text-sm text-zinc-400 block mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword ? "text" : "password"
                      }
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Password is required",
                      })}
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-green-400/50 focus:bg-green-400/[0.03] transition-all outline-none rounded-2xl px-4 py-3 text-sm"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {errors.password && (
                    <p className="text-red-400 text-xs mt-2">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-black font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 mt-2"
                >
                  {loading && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {loading
                    ? "Signing in..."
                    : "Sign In"}
                </button>

              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">

                <p className="text-sm text-zinc-500">
                  New Student?{" "}
                  <Link
                    to="/register"
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}