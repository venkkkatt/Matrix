import { useState } from "react";
import { X, Image, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
import Avatar from "../shared/Avatar";

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { user } = useAuthStore();
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImages = (files) => {
    const arr = Array.from(files);
    if (arr.length > 5) { toast.error("Max 5 images"); return; }
    const valid = arr.filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} is too large (max 5MB)`); return false; }
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); return false; }
      return true;
    });
    setImages(valid);
    setPreviews(valid.map((f) => URL.createObjectURL(f)));
    setCurrentPreview(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImages(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
    setCurrentPreview(Math.min(currentPreview, newPreviews.length - 1));
  };

  const handleSubmit = async () => {
    if (!caption.trim()) { toast.error("Caption is required"); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("caption", caption);
      images.forEach((img) => formData.append("images", img));
      const res = await api.post("/posts/create", formData);
      toast.success("Post created!");
      onPostCreated?.(res.data.post);
      onClose();
    } catch {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "rgba(12,15,12,0.98)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-semibold">Create Post</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          <div className="flex items-center gap-3 mb-4">
            <Avatar user={user} size={9} />
            <div>
              <p className="text-[13px] font-medium text-white/90">{user?.fullName}</p>
              <p className="text-[11px] text-white/30">@{user?.userName}</p>
            </div>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            autoFocus
            className="w-full bg-transparent text-[14px] text-white/80 placeholder-white/20 outline-none resize-none leading-relaxed mb-4"
          />

          {previews.length > 0 && (
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img
                src={previews[currentPreview]}
                alt=""
                className="w-full object-cover max-h-72"
              />

              {previews.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPreview((p) => (p - 1 + previews.length) % previews.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPreview((p) => (p + 1) % previews.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {previews.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {previews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPreview(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentPreview ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => removeImage(currentPreview)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500/80 transition-all"
              >
                <X size={14} />
              </button>

              {previews.length > 1 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[11px] text-white">
                  {currentPreview + 1}/{previews.length}
                </div>
              )}
            </div>
          )}

          {previews.length > 1 && (
            <div className="flex gap-2 mb-4">
              {previews.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPreview(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all ${
                    i === currentPreview
                      ? "ring-2 ring-green-400"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={src} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          {previews.length === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                dragOver
                  ? "border-green-400/50 bg-green-400/5"
                  : "border-white/8 hover:border-white/15"
              }`}
              onClick={() => document.getElementById("post-images").click()}
            >
              <Image size={28} className="mx-auto mb-2 text-white/20" />
              <p className="text-[13px] text-white/30">Drop images here or click to upload</p>
              <p className="text-[11px] text-white/15 mt-1">Up to 5 images · Max 5MB each</p>
            </div>
          )}

          <input
            id="post-images"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImages(e.target.files)}
          />
        </div>

        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById("post-images").click()}
              className="flex items-center gap-1.5 text-[13px] text-white/30 hover:text-green-400 transition-colors"
            >
              <Image size={17} />
              <span>{previews.length > 0 ? `${previews.length} image${previews.length > 1 ? "s" : ""}` : "Add photos"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[12px] ${caption.length > 480 ? "text-red-400" : "text-white/20"}`}>
              {caption.length}/500
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || !caption.trim() || caption.length > 500}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] font-medium hover:bg-green-400/15 disabled:opacity-40 transition-all"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}