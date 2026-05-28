import { useForm } from "react-hook-form";
import { useState } from "react";

import { Loader2,Eye,EyeOff,Upload,} from "lucide-react";

import { Link, useNavigate, } from "react-router-dom";

import { toast } from "sonner";

import { registerApi } from "../../api/authApi";

import useAuthStore from "../../store/authStore";

export default function Register() {
  const { register, handleSubmit, formState: { errors },} = useForm();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState("");
  const inputClass = "w-full bg-white/[0.04] border border-white/10 focus:border-green-400/50 focus:bg-green-400/[0.03] transition-all outline-none rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600";

  const onSubmit = async (data) => {
  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("fullName", data.fullName);
    formData.append("userName", data.userName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("gender", data.gender)
    formData.append("dept", data.dept)

    if (profilePicFile) {
      formData.append("profilePic", profilePicFile); 
    }

    const res = await registerApi(formData);
    login(res.user);
    toast.success(`Welcome to Matrix ${res.user.userName}`);
    navigate("/");
  } catch (err) {
    toast.error(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-[#010104] text-white overflow-hidden relative">

      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-[#022003] blur-[120px] rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-green-600/10 blur-[120px] rounded-full" />

      <div className="relative z-10 min-h-screen grid">
        <div className="hidden lg:flex flex-col justify-center px-24">
          <div>
          </div>
        </div>

        <div className="font-clash flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-10">
              <h1 className="text-5xl font-array tracking-tight">
                MATRIX
              </h1>
            </div>

            <div className="">
              <div className="mb-8">
                <h2 className="font-clash text-7xl">
                  Create Account
                </h2>

                <p className="text-zinc-500 mt-2 text-sm">
                  Enter your details to continue
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 font-clash"
              >
                <div className="flex flex-col items-center">

                  <label
                    htmlFor="profilePic"
                    className="
                      w-24
                      h-24
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.04]
                      flex
                      items-center
                      justify-center
                      overflow-hidden
                      cursor-pointer
                      hover:border-green-400/40
                      transition-all
                    "
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload
                        size={28}
                        className="text-zinc-500"
                      />
                    )}

                  </label>

                  <input
                    type="file"
                    id="profilePic"
                    accept="image/*"
                    className="hidden"
                    {...register("profilePic")}
                    onChange={(e) => {
                      const file =
                        e.target.files[0];

                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image must be below 5MB");
                            return;
                        }
                        if (!file.type.startsWith("image/")) {
                            toast.error("Only image files allowed");
                            return;
                        }
                        setProfilePicFile(file);
                        setPreview(URL.createObjectURL(file));
                        }
                    }}
                  />

                  <p className="text-xs text-zinc-500 mt-3">
                    Upload profile picture
                  </p>

                </div>

                <div>

                  <label className="text-sm text-zinc-400 block mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter full name"
                    {...register("fullName", {
                      required:
                        "Full name is required",
                    })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-green-400/50 focus:bg-green-400/[0.03] transition-all outline-none rounded-2xl px-4 py-3 text-sm"
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-xs mt-2">
                      {
                        errors.fullName
                          .message
                      }
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    {...register("userName", {
                      required:
                        "Username is required",
                    })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-green-400/50 focus:bg-green-400/[0.03] transition-all outline-none rounded-2xl px-4 py-3 text-sm"
                  />
                  {errors.userName && (
                    <p className="text-red-400 text-xs mt-2">
                      {
                        errors.userName
                          .message
                      }
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter email"
                    {...register("email", {
                      required:
                        "Email is required",
                    })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-green-400/50 focus:bg-green-400/[0.03] transition-all outline-none rounded-2xl px-4 py-3 text-sm"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-2">
                      {
                        errors.email.message
                      }
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
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="••••••••"
                      {...register("password", {
                        required:
                          "Password is required",
                      })}
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-green-400/50 focus:bg-green-400/[0.03] transition-all outline-none rounded-2xl px-4 py-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
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
                      {
                        errors.password
                          .message
                      }
                    </p>
                  )}

                </div>

                 <div>
                   <label className="text-sm text-zinc-400 block mb-3">Gender</label>
                   <div className="flex gap-4">
                        {["Male", "Female", "Other"].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                            <input
                                type="radio"
                                value={g}
                                {...register("gender", { required: "Select a gender" })}
                                className="sr-only peer"
                            />
                            <div className="w-4 h-4 rounded-full border border-white/20 peer-checked:border-green-400 peer-checked:bg-green-400/20 transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-0 peer-checked:opacity-100 transition-all" />
                            </div>
                            </div>
                            <span className="text-2 text-zinc-400 group-hover:text-white transition-colors">{g}</span>
                        </label>
                ))}
                 </div>
              {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender.message}</p>}
            </div>

                <div>
                  <label className="text-sm text-zinc-400 block mb-2">Department</label>
                <input
                  type="text"
                  placeholder="ISE, CSE, ECE, MECH..."
                  {...register("dept")}
                  className={inputClass}
                />
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
                    ? "Creating account..."
                    : "Create Account"}

                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-zinc-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    Sign in
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