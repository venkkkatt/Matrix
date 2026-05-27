import { useState } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
import { toast } from "sonner";
import Avatar from "../shared/Avatar";

export default function CommentSection({ postId, postAuthorId, initialComments = [], onCommentAdded }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);


  const handleSubmit = async () => {
  if (!text.trim()) return;
  try {
    setLoading(true);
    const res = await api.post(`/posts/${postId}/comment`, { text });
    console.log("comment added, calling onCommentAdded", postId, res.data.comments);

    setComments(res.data.comments);
    onCommentAdded?.(postId, res.data.comments); 
    setText("");
  } catch {
    toast.error("Failed to add comment");
  } finally {
    setLoading(false);
  }
  };

    const handleDelete = async (commentId) => {
    try {
      setDeletingId(commentId);
      const res = await api.delete(`/posts/${postId}/comment/${commentId}`);
      setComments(res.data.comments);
      onCommentAdded?.(postId, res.data.comments);
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (comment) => {
    if (!user) return false;
    const isCommentOwner = comment.user?._id === user._id;
    const isPostOwner = postAuthorId === user._id;
    return isCommentOwner || isPostOwner;
  };

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-[13px] text-white/30">No comments yet</p>
            <p className="text-[11px] text-white/20 mt-1">Be the first to comment</p>
          </div>
        ) : (
          comments.map((c, i) => (
            <div key={i} className="flex items-start gap-2.5 group">
              <Avatar user={c.user} size={7} clickable />
              <div className="flex-1 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.000001)" }}>
                <div className="flex flex-row justify-between">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link
                    to={`/profile/${c.user?.userName}`}
                    className="text-[11px] font-medium text-white/60 hover:text-green-400 transition-colors"
                  >
                    @{c.user?.userName}
                  </Link>
                  <span className="text-[10px] text-white/20">
                    {c.createdAt && formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {canDelete(c) && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 p-0.5 rounded disabled:opacity-30"
                    >
                      {deletingId === c._id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Trash2 size={12} />
                      }
                    </button>
                  )}
                  </div>
                <p className="text-[13px] text-white/60 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-3">
        <Avatar user={user} size={7} />
        <div
          className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder-white/20 outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="text-green-400 disabled:opacity-30 hover:text-green-300 transition-colors shrink-0"
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}