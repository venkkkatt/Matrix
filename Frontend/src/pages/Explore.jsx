import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import { UserPlus, UserCheck, TrendingUp, Star, Clock } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState([]);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
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

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/follow/${userId}`);
      setFollowing((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    } catch {
      toast.error("Failed to follow");
    }
  };

  const topUsers = [...users].sort((a, b) => b.followers.length - a.followers.length).slice(0, 6);
  const trendingUsers = [...users].sort((a, b) => b.followers.length - a.followers.length).slice(6, 12);
  const newUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

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
        <p className="text-[13px] text-white/25 mt-0.5">Discover people on Matrix</p>
      </div>

      <UserSection
        title="Top Users"
        icon={<Star size={14} />}
        users={topUsers}
        following={following}
        onFollow={handleFollow}
      />
      <UserSection
        title="Trending"
        icon={<TrendingUp size={14} />}
        users={trendingUsers}
        following={following}
        onFollow={handleFollow}
      />
      <UserSection
        title="New to Matrix"
        icon={<Clock size={14} />}
        users={newUsers}
        following={following}
        onFollow={handleFollow}
      />
    </div>
  );
}

function UserSection({ title, icon, users, following, onFollow }) {
  if (users.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-green-400">{icon}</span>
        <h2 className="text-[14px] font-semibold text-white/70 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {users.map((u) => (
          <UserCard key={u._id} user={u} isFollowing={following.includes(u._id)} onFollow={() => onFollow(u._id)} />
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