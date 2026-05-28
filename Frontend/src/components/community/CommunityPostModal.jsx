import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X} from "lucide-react";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

import Avatar from "../../components/shared/Avatar";

export default function CommunityPostModal({ communityId, onClose, onPostCreated }) {
  const { user } = useAuthStore();
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!caption.trim()) { toast.error("Caption is required"); return; }
    try {
      setLoading(true);
      const res = await api.post(`/communities/${communityId}/post`, { caption, communityId });
      toast.success("Posted!");
      onPostCreated(res.data.post);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "rgba(12,15,12,0.98)", border: "0.5px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-semibold">Post to Community</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar user={user} size={9} />
            <div>
              <p className="text-[13px] font-medium">{user?.fullName}</p>
              <p className="text-[11px] text-white/30">@{user?.userName}</p>
            </div>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            autoFocus
            className="w-full bg-transparent text-[14px] text-white/80 placeholder-white/20 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
          <span className={`text-[12px] ${caption.length > 480 ? "text-red-400" : "text-white/20"}`}>
            {caption.length}/500
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || !caption.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] font-medium hover:bg-green-400/15 disabled:opacity-40 transition-all"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}