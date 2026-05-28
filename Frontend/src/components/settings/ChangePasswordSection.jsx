import { useState} from "react";
import { toast } from "sonner";
import { Loader2} from "lucide-react";
import api from "../../api/axios";

export default function ChangePasswordSection() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!form.current || !form.newPass) { toast.error("Fill all fields"); return; }
    if (form.newPass !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.newPass.length < 6) { toast.error("Min 6 characters"); return; }
    try {
      setLoading(true);
      await api.put("/users/change-password", {
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      toast.success("Password changed!");
      setShow(false);
      setForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="w-full py-2.5 rounded-xl border border-white/8 text-white/50 text-[13px] hover:border-white/15 hover:text-white transition-all"
      >
        Change Password
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {[
        { key: "current", placeholder: "Current password" },
        { key: "newPass", placeholder: "New password" },
        { key: "confirm", placeholder: "Confirm new password" },
      ].map(({ key, placeholder }) => (
        <div key={key} className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            className={inputClass}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShow(false)}
          className="flex-1 py-2 rounded-xl border border-white/8 text-white/40 text-[13px] hover:border-white/15 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleChange}
          disabled={loading}
          className="flex-1 py-2 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] hover:bg-green-400/15 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          {loading ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
}