import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Grid, Bookmark, UserCheck, UserPlus, X } from "lucide-react";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import PostCard from "../components/feed/PostCard";
import PostModal from "../components/feed/PostModal";


export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const selectedPost = posts.find((p) => p._id === selectedPostId) || null;
  const isOwner = currentUser?.userName === username;
  const navigate = useNavigate();

  useEffect(() => {
  if (!username && currentUser?.userName) {
    navigate(`/profile/${currentUser.userName}`);
  }
}, [username, currentUser]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    setActiveTab("posts"); 
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/profile/${username}`);
      setProfile(res.data.user);
      setIsFollowing(
        res.data.user.followers.some((f) => f._id === currentUser?._id)
      );
    } catch {
      toast.error("User not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/users/profile/${username}/posts`);
      setPosts(res.data.posts);
    } catch {}
  };

  const handleFollow = async () => {
    try {
      await api.put(`/users/follow/${profile._id}`);
      setIsFollowing(!isFollowing);
      setProfile((prev) => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter((f) => f._id !== currentUser._id)
          : [...prev.followers, { _id: currentUser._id }],
      }));
    } catch {
      toast.error("Failed to follow");
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const alreadyLiked = p.likes.includes(currentUser._id);
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((id) => id !== currentUser._id)
              : [...p.likes, currentUser._id],
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

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white/30">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-start gap-6">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-2xl font-black text-black shrink-0 overflow-hidden">
            {profile.profilePic?.url
              ? <img src={profile.profilePic.url} className="w-full h-full object-cover" alt="" />
              : profile.userName?.[0]?.toUpperCase()
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div>
                <h1 className="text-xl font-black tracking-tight">{profile.fullName}</h1>
                <p className="text-[13px] text-white/40">@{profile.userName}</p>
                {profile.dept && (
                  <p className="text-[12px] text-green-400/70 mt-0.5">{profile.dept}</p>
                )}
              </div>

              {isOwner ? (
                <Link to={"/settings"}>
                <button className="px-4 py-1.5 rounded-xl text-[13px] font-medium border border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-all">
                  Edit Profile
                </button>
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-medium transition-all ${
                    isFollowing
                      ? "border border-white/10 text-white/50 hover:border-red-400/30 hover:text-red-400"
                      : "bg-green-400/10 border border-green-400/20 text-green-400 hover:bg-green-400/15"
                  }`}
                >
                  {isFollowing
                    ? <><UserCheck size={14} /> Following</>
                    : <><UserPlus size={14} /> Follow</>
                  }
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-[13px] text-white/50 mt-2 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-5 mt-4">
              <div className="text-center">
                <p className="text-[16px] font-black">{posts.length}</p>
                <p className="text-[11px] text-white/30">Posts</p>
              </div>
              <button
                onClick={() => setShowFollowers(true)}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <p className="text-[16px] font-black">{profile.followers?.length || 0}</p>
                <p className="text-[11px] text-white/30">Followers</p>
              </button>
              <button
                onClick={() => setShowFollowing(true)}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <p className="text-[16px] font-black">{profile.following?.length || 0}</p>
                <p className="text-[11px] text-white/30">Following</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "posts"
              ? "bg-green-400/10 text-green-400 border border-green-400/20"
              : "text-white/30 hover:text-white"
          }`}
        >
          <Grid size={14} />
          Posts
        </button>
        {(isOwner && <button
          onClick={() => setActiveTab("saved")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "saved"
              ? "bg-green-400/10 text-green-400 border border-green-400/20"
              : "text-white/30 hover:text-white"
          }`}
        >
          <Bookmark size={14} />
          Saved
        </button> 
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white/30 text-[14px]">No posts yet</p>
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

      {showFollowers && (
        <UsersModal
          title="Followers"
          users={profile.followers}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {showFollowing && (
        <UsersModal
          title="Following"
          users={profile.following}
          onClose={() => setShowFollowing(false)}
        />
      )}
    </div>
  );
}

function UsersModal({ title, users, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "rgba(15,18,15,0.97)",
          border: "0.5px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-80 p-3 space-y-1">
          {users?.length === 0 ? (
            <p className="text-center text-white/25 text-[13px] py-8">No {title.toLowerCase()} yet</p>
          ) : (
            users?.map((u) => (
              <div key={u._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-[12px] font-bold text-black shrink-0 overflow-hidden">
                  {u.profilePic?.url
                    ? <img src={u.profilePic.url} className="w-full h-full object-cover" alt="" />
                    : u.userName?.[0]?.toUpperCase()
                  }
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white/85">{u.fullName}</p>
                  <p className="text-[11px] text-white/30">@{u.userName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}