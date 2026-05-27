import { useEffect, useState } from "react";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import { toast } from "sonner";
import PostCard from "../components/feed/PostCard";
import PostModal from "../components/feed/PostModal";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { user } = useAuthStore();
  const selectedPost = posts.find((p) => p._id === selectedPostId) || null;


  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await api.get("/posts/feed");
      setPosts(res.data.posts);
    } catch {
      toast.error("Failed to load feed");
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

  const handleCommentAdded = (postId, newComments) => {
  setPosts((prev) =>
    prev.map((p) =>
      p._id === postId ? { ...p, comments: newComments } : p
    )
  );
};
  const handleDelete = (postId) => {
  setPosts((prev) => prev.filter((p) => p._id !== postId));
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

      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Feed</h1>
        <p className="text-[13px] text-white/25 mt-0.5">
          {posts.length} posts from your college
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-white/40 font-medium">No posts yet</p>
          <p className="text-white/20 text-[13px] mt-1">
            Be the first to post something!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onClick={() => setSelectedPostId(post._id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPostId(null)}
          onLike={handleLike}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}