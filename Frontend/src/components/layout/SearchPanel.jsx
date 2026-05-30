import { useState } from "react";
import { Search, X, UserPlus, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "sonner";
import Avatar from "../shared/Avatar";
import useAuthStore from "@/store/authStore";

export default function SearchPanel({ onClose }) {
  const {user, login} = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    try {
      setLoading(true);
      const res = await api.get(`/users/search?q=${q}`);
      setResults(res.data.users);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await api.put(`/users/follow/${userId}`);
     console.log("following",res.data.following);
      login({
      ...user,
      following: res.data.following
    });
    console.log(res.data.following);
    } catch (e) {
      console.log(e)
      toast.error("Failed to follow");
    }
  };

  return (
    <div className="flex flex-col h-full px-3 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-black tracking-tight">Search</h2>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          autoFocus
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search people..."
          className="w-full bg-white/4 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-green-400/30 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {results.map((u) => (
          <div key={u._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/3 transition-all">
            <Link to={`/profile/${u.userName}`} onClick={onClose}>
              <Avatar user={u} size={9} />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${u.userName}`} onClick={onClose}>
                <p className="text-[13px] font-medium text-white/85 hover:text-green-400 transition-colors truncate">{u.fullName}</p>
              </Link>
              <p className="text-[11px] text-white/30">@{u.userName} {u.dept && `· ${u.dept}`}</p>
            </div>
            <button
              onClick={() => handleFollow(u._id)}
              className={`shrink-0 p-1.5 rounded-lg transition-all ${
                 user?.following?.some((id) => id.toString() === u._id.toString()) ? "text-green-400 bg-green-400/10" : "text-white/30 hover:text-green-400 hover:bg-green-400/10"
              }`}
            >
              {user?.following?.some((id) => id.toString() === u._id.toString()) ? <UserCheck size={14} /> : <UserPlus size={14} />}
            </button>
          </div>
        ))}
        {!loading && query && results.length === 0 && (
          <p className="text-center text-white/25 text-[13px] py-8">No results for "{query}"</p>
        )}
      </div>
    </div>
  );
}