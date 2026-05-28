import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Users, ArrowLeft, PlusSquare, Loader2, Send, X, Image } from "lucide-react";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import PostCard from "../components/feed/PostCard";
import PostModal from "../components/feed/PostModal";
import Avatar from "../components/shared/Avatar";
import CommunityPostModal from "@/components/community/CommunityPostModal";

export default function CommunityDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const selectedPost = posts.find((p) => p._id === selectedPostId) || null;

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      const res = await api.get(`/communities/${id}`);
      setCommunity(res.data.community);
      const joined = res.data.community.members.some(
        (m) => m._id === user._id || m === user._id
      );
      setIsJoined(joined);
    } catch {
      toast.error("Community not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/communities/${id}/posts`);
      setPosts(res.data.posts);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      const res = await api.put(`/communities/${id}/join`);
      setIsJoined(res.data.joined);
      toast.success(res.data.message);
      fetchCommunity();
    } catch {
      toast.error("Failed to join");
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

  const handlePostCreated = (post) => {
    setPosts((prev) => [post, ...prev]);
    setShowCreate(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white/30">Community not found</p>
      </div>
    );
  }

  const isAdmin = community.admin?._id === user._id || community.admin === user._id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <Link
        to="/communities"
        className="flex items-center gap-2 text-[13px] text-white/30 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Communities
      </Link>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-700/20 border border-green-400/10 flex items-center justify-center text-2xl shrink-0">
              {community.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{community.name}</h1>
              <p className="text-[13px] text-white/40 mt-0.5">{community.description || "No description"}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-[12px] text-white/30">
                  <Users size={13} />
                  {community.members?.length || 0} members
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                  community.type === "open"
                    ? "border-green-400/20 text-green-400/70 bg-green-400/5"
                    : "border-white/10 text-white/30"
                }`}>
                  {community.type}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Avatar user={community.admin} size={5} />
                <p className="text-[11px] text-white/25">
                  Created by{" "}
                  <Link to={`/profile/${community.admin?.userName}`} className="text-green-400/70 hover:text-green-400 transition-colors">
                    @{community.admin?.userName}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {!isAdmin && (
            <button
              onClick={handleJoin}
              className={`shrink-0 px-4 py-1.5 rounded-xl text-[13px] font-medium border transition-all ${
                isJoined
                  ? "border-white/10 text-white/40 hover:border-red-400/30 hover:text-red-400"
                  : "border-green-400/20 text-green-400 bg-green-400/10 hover:bg-green-400/15"
              }`}
            >
              {isJoined ? "Leave" : "Join"}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-white/70">Posts</h2>
        {isJoined && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] hover:bg-green-400/15 transition-all"
          >
            <PlusSquare size={14} />
            Post
          </button>
        )}
      </div>

      {!isJoined && (
        <div
          className="rounded-2xl p-4 mb-6 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[13px] text-white/40">Join this community to post and interact</p>
          <button
            onClick={handleJoin}
            className="mt-2 px-4 py-1.5 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] hover:bg-green-400/15 transition-all"
          >
            Join Community
          </button>
        </div>
      )}

      {postsLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-white/30 text-[14px]">No posts yet</p>
          {isJoined && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 px-4 py-1.5 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] hover:bg-green-400/15 transition-all"
            >
              Be the first to post
            </button>
          )}
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
          onDelete={handleDelete}
        />
      )}

      {showCreate && (
        <CommunityPostModal
          communityId={id}
          onClose={() => setShowCreate(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}