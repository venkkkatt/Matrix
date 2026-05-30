import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Edit, Flag, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useAuthStore from "../../store/authStore";
import { toast } from "sonner";
import Avatar from "../shared/Avatar";
import api from "../../api/axios";

export default function PostCard({ post, onLike, onClick, onDelete, onSaveToggle }) {
  const { user } = useAuthStore();
  const isLiked = post.likes.includes(user?._id);
  const isOwner = post.author?._id === user?._id;
  const saved = user?.savedPosts?.some((id) => id.toString() === post._id.toString());  
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleReport = (e) => {
    e.stopPropagation();
    toast.success("Post reported. We'll review it shortly.");
    setShowMenu(false);
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-4 mb-8 transition-all hover:scale-[1.01]"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar user={post.author} size={9} clickable />
          <div>
            <Link
              to={`/profile/${post.author?.userName}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-medium text-white/90 hover:text-green-400 transition-colors leading-none block mb-0.5"
            >
              <p className="text-[11px] text-white/30 hover:text-green-400">
              @{post.author?.userName}
              {post.author?.dept && ` · ${post.author.dept}`}
              {" · "}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
            </Link>
            
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="text-white/20 hover:text-white/50 transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 w-44 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{
                background: "rgba(15,18,15,0.95)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {isOwner ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); toast.info("Edit coming soon!"); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Edit size={14} />
                    Edit post
                  </button>
                  <div className="border-t border-white/5" />
                  <button
                    onClick={(e) => {e.stopPropagation(); onDelete(post._id); setShowMenu(false);}}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                    Delete post
                  </button>
                </>
              ) : (
                <button
                  onClick={handleReport}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Flag size={14} />
                  Report post
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      <p className="text-[13px] text-white/70 leading-relaxed mb-3 line-clamp-3">
        {post.caption}
      </p>

      {post.images?.length > 0 && (
        <div className={`grid gap-1 mb-3 rounded-xl overflow-hidden ${
          post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
        }`}>
          {post.images.slice(0, 2).map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt=""
              className="w-full object-cover max-h-64"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={(e) => { e.stopPropagation(); onLike(post._id); }}
          className={`flex items-center gap-1.5 text-[12px] transition-all ${
            isLiked ? "text-red-400" : "text-white/30 hover:text-red-400"
          }`}
        >
          <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
          {post.likes.length}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white transition-colors"
        >
          <MessageCircle size={15} />
          {post.comments?.length || 0}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white transition-colors"
        >
          <Share2 size={15} />
        </button>
  
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSaveToggle(post._id);
          }}
          className={`ml-auto text-[12px] transition-all ${
            saved ? "text-green-400" : "text-white/30 hover:text-green-400"
          }`}
        >
          <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}