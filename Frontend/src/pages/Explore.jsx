import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import { UserPlus, UserCheck, TrendingUp, Star, Clock } from "lucide-react";
import useAuthStore from "../store/authStore";
import PostFeed from "@/components/feed/PostFeed";

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, login } = useAuthStore();
  const [following, setFollowing] = useState(
    currentUser?.following?.map((f) => f._id?.toString() || f.toString()) || []
  );
  const followingIds = currentUser?.following?.map((f) =>
    typeof f === "object" ? f._id?.toString() : f?.toString()
  ) || [];

  
  useEffect(() => {
    fetchUsers();
    fetchSuggestions();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/all");
      setUsers(res.data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    const res = await api.get("/users/suggestions");
    setSuggestions(res.data.users);
  }

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/follow/${userId}`);
      
      const isFollowing = followingIds.includes(userId.toString());
      const updatedFollowing = isFollowing
        ? currentUser.following.filter((f) => {
            const id = typeof f === "object" ? f._id?.toString() : f?.toString();
            return id !== userId.toString();
          })
        : [...(currentUser.following || []), userId];

      login({ ...currentUser, following: updatedFollowing });
    } catch (error) {
      console.log(error)
      toast.error("Failed to follow");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Explore</h1>
        <p className="text-[13px] text-white/25 mt-0.5">Discover people, communities and more</p>
      </div>

      <UserSection
        title="Suggested Users"
        icon={<Star size={14} />}
        users={suggestions}
        followingIds={followingIds}
        onFollow={handleFollow}
      />

      <div className="flex items-center gap-2">
        <span className="text-green-400"><TrendingUp size={14} /></span>
        <h2 className="text-[14px] font-semibold text-white/70 uppercase tracking-widest">Trending Posts</h2>
      </div>
      
      <PostFeed endpoint={"/posts/trending"} title={""} subtitle={""}/>

    </div>
  );
}

function UserSection({ title, icon, users, followingIds, onFollow }) {
  if (users.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-green-400">{icon}</span>
        <h2 className="text-[14px] font-semibold text-white/70 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {users.map((u) => (
          <UserCard key={u._id} user={u} isFollowing={followingIds.includes(u._id?.toString())} onFollow={() => onFollow(u._id)} />
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, isFollowing, onFollow }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01]"
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
    >
      <Link to={`/profile/${user.userName}`} className="shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-[14px] font-bold text-black overflow-hidden">
          {user.profilePic?.url
            ? <img src={user.profilePic.url} className="w-full h-full object-cover" alt="" />
            : user.userName?.[0]?.toUpperCase()
          }
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.userName}`}>
          <p className="text-[13px] font-medium text-white/90 truncate hover:text-green-400 transition-colors">{user.fullName}</p>
        </Link>
        <p className="text-[11px] text-white/30 truncate">@{user.userName} {user.dept && `· ${user.dept}`}</p>
        <p className="text-[11px] text-white/20">{user.followers.length} followers</p>
      </div>
      <button
        onClick={onFollow}
        className={`shrink-0 p-1.5 rounded-lg transition-all ${
          isFollowing
            ? "text-green-400 bg-green-400/10"
            : "text-white/30 hover:text-green-400 hover:bg-green-400/10"
        }`}
      >
        {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
      </button>
    </div>
  );
}