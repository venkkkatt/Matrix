import { useEffect, useState } from "react";
import { X, Heart, Share2, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import useAuthStore from "../../store/authStore";
import api from "@/api/axios";
import Avatar from "../shared/Avatar";
import CommentSection from "./CommentSection";

export default function PostModal({ post, onClose, onLike, onCommentAdded, onSaveToggle }) {
  const { user, login } = useAuthStore();
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [currentImage, setCurrentImage] = useState(0);
  const saved = user?.savedPosts?.some((id) => id.toString() === post._id.toString());

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleLike = () => {
    onLike(post._id);
    setLiked(!liked);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex"
        style={{
          background: "rgba(15,18,15,0.95)",
          backdropFilter: "blur(20px)",
          border: "0.5px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >

         {post.images?.length > 0 && (<div className="w-[55%] bg-black flex items-center justify-center shrink-0 relative">
         
            <>
              <img
                src={post.images[currentImage]?.url}
                alt=""
                className="w-full h-full object-cover max-h-[90vh]"
              />
              {post.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {post.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentImage ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          
        </div>)}

        <div className="flex-1 flex flex-col min-h-[500px] max-h-[90vh] overflow-hidden">

          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5">
              <Avatar user={post.author} size={9} clickable />
              <div>
                <Link
                  to={`/profile/${post.author?.userName}`}
                  className="text-[13px] font-medium text-white/90 hover:text-green-400 transition-colors block leading-none mb-0.5"
                >
                  {post.author?.fullName}
                   <p className="text-[11px] text-white/300">
                  @{post.author?.userName}
                  {post.author?.dept && ` · ${post.author.dept}`}
                  
                </p>
                </Link>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/25 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-3" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] text-white/70">@{post.author?.userName}
                {" · "}
                {/* {post.caption} */}
            </p>
            <p className="text-[16px] text-white leading-relaxed">{post.caption}</p>
            
            <p className="text-[9px] mt-2 text-white/70 leading-relaxed">
                {" · "}
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>

          <div className="flex-1 overflow-hidden px-5 py-3">
            <CommentSection
              postId={post._id}
              postAuthorId={post.author?._id}
              initialComments={post.comments || []}
              onCommentAdded={onCommentAdded}
            />
          </div>

          <div className="px-5 py-3 flex items-center gap-4"
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
            <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[13px] transition-all ${
                liked ? "text-red-400" : "text-white/30 hover:text-red-400"
            }`}
            >
            <Heart size={17} fill={liked ? "currentColor" : "none"} />
            {likeCount}
            </button>


            <button className="flex items-center gap-1.5 text-[13px] text-white/30 hover:text-white transition-colors">
              <Share2 size={17} />
            </button>

            <button
              onClick={(e) => onSaveToggle(post._id)}
              className={`ml-auto text-[13px] transition-all ${
                saved ? "text-green-400" : "text-white/30 hover:text-green-400"
              }`}
            >
              <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}