import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Camera, Loader2, Eye, EyeOff, User, Phone, BookOpen, FileText, ChevronRight, Lock } from "lucide-react";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import ChangePasswordSection from "../components/settings/ChangePasswordSection"

export default function Settings() {
  const { user, login } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [posts, setPosts] = useState([]);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePic?.url || "");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      userName: user?.userName || "",
      bio: user?.bio || "",
      dept: user?.dept || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
    }
  });

  useEffect(() => {
    const fetchPosts = async () => {
        try {
        const res = await api.get(`/users/profile/${user?.userName}/posts`);
        setPosts(res.data.posts || []);
        } catch (error) {
        console.log(error);
        }
    };

    if (user?.userName) {
        fetchPosts();
    }
    }, [user]);
    
  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be below 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Only images allowed"); return; }
    setProfilePicFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) formData.append(key, data[key]);
      });
      if (profilePicFile) formData.append("profilePic", profilePicFile);
      const res = await api.put("/users/update", formData);
      login(res.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "profile",   label: "Profile",          icon: User },
    { id: "account",   label: "Account",           icon: Lock },
    { id: "contact",   label: "Contact",           icon: Phone },
    { id: "about",     label: "About",             icon: FileText },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="text-[13px] text-white/25 mt-0.5">Manage your account</p>
      </div>

      <div className="flex gap-6">

        <div className="w-48 shrink-0">
          <div className="flex flex-col gap-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  activeSection === id
                    ? "bg-green-400/10 text-green-400 border border-green-400/15"
                    : "text-white/40 hover:text-white hover:bg-white/3"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} />
                  {label}
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>

            {activeSection === "profile" && (
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
              >
                <h2 className="text-[15px] font-semibold mb-5">Profile Info</h2>

                {/* Profile Picture */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-2xl font-black text-black overflow-hidden">
                      {preview
                        ? <img src={preview} className="w-full h-full object-cover" alt="" />
                        : user?.userName?.[0]?.toUpperCase()
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-green-400 flex items-center justify-center text-black hover:bg-green-300 transition-all"
                    >
                      <Camera size={13} />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePic}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white/80">{user?.fullName}</p>
                    <p className="text-[12px] text-white/30">@{user?.userName}</p>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-[12px] text-green-400 hover:text-green-300 transition-colors mt-1"
                    >
                      Change photo
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Full Name" error={errors.fullName}>
                    <input
                      {...register("fullName", { required: "Full name is required" })}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Bio" error={errors.bio}>
                    <textarea
                      {...register("bio")}
                      placeholder="Tell people about yourself..."
                      rows={3}
                      className={inputClass + " resize-none"}
                    />
                  </Field>

                  <Field label="Department">
                    <input
                      {...register("dept")}
                      placeholder="CSE, ECE, MECH..."
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Gender">
                    <select {...register("gender")} className={inputClass}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {activeSection === "account" && (
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
              >
                <h2 className="text-[15px] font-semibold mb-5">Account</h2>
                <div className="space-y-4">
                  <Field label="Username" error={errors.userName}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm">@</span>
                      <input
                        {...register("userName", {
                          required: "Username is required",
                          minLength: { value: 3, message: "Min 3 characters" },
                          pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers and underscores" }
                        })}
                        placeholder="username"
                        className={inputClass + " pl-8"}
                      />
                    </div>
                  </Field>

                  {/* Change password — just UI for now */}
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[12px] text-white/40 mb-3 uppercase tracking-widest">Password</p>
                    <ChangePasswordSection />
                  </div>

                  {/* Danger zone */}
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[12px] text-red-400/60 mb-3 uppercase tracking-widest">Danger Zone</p>
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-[13px] hover:bg-red-500/10 transition-all"
                      onClick={() => toast.error("Account deletion coming soon")}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "contact" && (
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
              >
                <h2 className="text-[15px] font-semibold mb-5">Contact Info</h2>
                <div className="space-y-4">
                  <Field label="Phone Number" error={errors.phone}>
                    <input
                      {...register("phone", {
                        pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                      })}
                      placeholder="10-digit phone number"
                      className={inputClass}
                    />
                  </Field>
                  <p className="text-[11px] text-white/20">Phone number is private and not shown to others.</p>
                </div>
              </div>
            )}

            {/* About Section */}
            {activeSection === "about" && (
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
              >
                <h2 className="text-[15px] font-semibold mb-5">About</h2>
                <div className="space-y-3">
                  {[
                    { label: "Member since", value: new Date(user?.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
                    { label: "Posts", value:  posts?.length || "-"},
                    { label: "Followers", value: user?.followers?.length || 0 },
                    { label: "Following", value: user?.following?.length || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <p className="text-[13px] text-white/40">{label}</p>
                      <p className="text-[13px] text-white/70 capitalize">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection !== "about" && (
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] font-medium hover:bg-green-400/15 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-[12px] text-white/40 mb-1.5 block uppercase tracking-widest">{label}</label>
      {children}
      {error && <p className="text-red-400 text-[11px] mt-1">{error.message}</p>}
    </div>
  );
}

const inputClass = "w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-green-400/30 transition-colors";