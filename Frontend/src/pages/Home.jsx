import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/posts/feed");
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

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
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Your Feed</h1>
        <p className="text-sm text-gray-500">{posts.length} posts from your college</p>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-400 font-medium">No posts yet</p>
          <p className="text-gray-600 text-sm mt-1">Be the first to post something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUser, onLike }) {
  const isLiked = post.likes.includes(currentUser?._id);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all">
      {/* Author */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            {post.author?.userName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{post.author?.fullName}</p>
            <p className="text-xs text-gray-500">
              @{post.author?.userName} ·{" "}
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <button className="text-gray-600 hover:text-gray-400 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Caption */}
      <p className="text-sm text-gray-200 leading-relaxed mb-3">{post.caption}</p>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt="post"
              className="w-full rounded-xl object-cover max-h-80"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? "text-pink-400" : "text-gray-500 hover:text-pink-400"
          }`}
        >
          <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
          {post.likes.length}
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400 transition-colors">
          <MessageCircle size={17} />
          {post.comments.length}
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-400 transition-colors ml-auto">
          <Share2 size={17} />
        </button>
      </div>
    </div>
  );
}