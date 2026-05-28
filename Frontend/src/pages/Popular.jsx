import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import useAuthStore from "../store/authStore";
import PostCard from "../components/feed/PostCard";
import PostModal from "../components/feed/PostModal";
import { Flame } from "lucide-react";

export default function Popular() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { user } = useAuthStore();

  const selectedPost = posts.find((p) => p._id === selectedPostId) || null;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts/feed");
      const sorted = [...res.data.posts].sort((a, b) => b.likes.length - a.likes.length);
      setPosts(sorted);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const alreadyLiked = p.likes.includes(user._id);
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((id) => id !== user._id)
              : [...p.likes, user._id],
          };
        })
      );
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleCommentAdded = (postId, newComments) => {
    setPosts((prev) =>
      prev.map((p) => p._id === postId ? { ...p, comments: newComments } : p)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Flame size={22} className="text-green-400" />
        <div>
          <h1 className="text-2xl font-black tracking-tight">Popular</h1>
          <p className="text-[13px] text-white/25 mt-0.5">Most liked posts on Matrix</p>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((post, i) => (
          <div key={post._id} className="relative">
            {i < 3 && (
              <div className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-[10px] font-black text-black">
                {i + 1}
              </div>
            )}
            <PostCard
              post={post}
              onLike={handleLike}
              onClick={() => setSelectedPostId(post._id)}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPostId(null)}
          onLike={handleLike}
          onCommentAdded={handleCommentAdded}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}