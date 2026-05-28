import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import { Users, Plus, TrendingUp, Compass, X } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await api.get("/communities");
      setCommunities(res.data.communities);
      const myJoined = res.data.communities
        .filter((c) => c.members.some((m) => m === user._id || m._id === user._id))
        .map((c) => c._id);
      setJoined(myJoined);
    } catch {
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId) => {
    try {
      const res = await api.put(`/communities/${communityId}/join`);
      setJoined((prev) =>
        res.data.joined
          ? [...prev, communityId]
          : prev.filter((id) => id !== communityId)
      );
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to join");
    }
  };

  const popular = [...communities].sort((a, b) => b.members.length - a.members.length).slice(0, 6);
  const trending = [...communities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const suggested = communities.filter((c) => !joined.includes(c._id)).slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Communities</h1>
          <p className="text-[13px] text-white/25 mt-0.5">Find your people</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] font-medium hover:bg-green-400/15 transition-all"
        >
          <Plus size={15} />
          Create
        </button>
      </div>

      <CommunitySection title="Popular" icon={<TrendingUp size={14} />} communities={popular} joined={joined} onJoin={handleJoin} />
      <CommunitySection title="Trending" icon={<Compass size={14} />} communities={trending} joined={joined} onJoin={handleJoin} />
      <CommunitySection title="Suggested for you" icon={<Users size={14} />} communities={suggested} joined={joined} onJoin={handleJoin} />

      {showCreate && <CreateCommunityModal onClose={() => setShowCreate(false)} onCreated={(c) => { setCommunities((prev) => [c, ...prev]); setShowCreate(false); }} />}
    </div>
  );
}

function CommunitySection({ title, icon, communities, joined, onJoin }) {
  if (communities.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-green-400">{icon}</span>
        <h2 className="text-[14px] font-semibold text-white/70 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {communities.map((c) => (
          <CommunityCard key={c._id} community={c} isJoined={joined.includes(c._id)} onJoin={() => onJoin(c._id)} />
        ))}
      </div>
    </div>
  );
}

function CommunityCard({ community, isJoined, onJoin }) {
  return (
    <div
      className="rounded-2xl p-4 transition-all hover:scale-[1.01]"
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link to={`/communities/${community._id}`} className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400/20 to-green-700/20 border border-green-400/10 flex items-center justify-center text-lg shrink-0">
          {community.name[0]}
        </Link>
        <button
          onClick={onJoin}
          className={`text-[11px] px-3 py-1 rounded-full border transition-all shrink-0 ${
            isJoined
              ? "border-white/10 text-white/30"
              : "border-green-400/30 text-green-400 hover:bg-green-400/10"
          }`}
        >
          {isJoined ? "Joined" : "Join"}
        </button>
      </div>
      <Link to={`/communities/${community._id}`}>
        <p className="text-[13px] font-medium text-white/85 truncate hover:text-green-400 transition-colors">{community.name}</p>
      </Link>
      <p className="text-[11px] text-white/30 truncate mt-0.5">{community.description || "No description"}</p>
      <p className="text-[11px] text-white/20 mt-1">{community.members.length} members</p>
    </div>
  );
}

function CreateCommunityModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("open");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    try {
      setLoading(true);
      const res = await api.post("/communities/create", { name, description, type });
      toast.success("Community created!");
      onCreated(res.data.community);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "rgba(15,18,15,0.97)", border: "0.5px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-[15px] font-semibold">Create Community</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[12px] text-white/40 mb-1.5 block uppercase tracking-widest">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Community name"
              className="w-full bg-white/4 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none border border-white/5 focus:border-green-400/30 transition-colors" />
          </div>
          <div>
            <label className="text-[12px] text-white/40 mb-1.5 block uppercase tracking-widest">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this community about?"
              rows={3}
              className="w-full bg-white/4 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none border border-white/5 focus:border-green-400/30 transition-colors resize-none" />
          </div>
          <div>
            <label className="text-[12px] text-white/40 mb-1.5 block uppercase tracking-widest">Type</label>
            <div className="flex gap-2">
              {["open", "private"].map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-[13px] capitalize transition-all ${
                    type === t
                      ? "bg-green-400/10 border border-green-400/20 text-green-400"
                      : "bg-white/3 border border-white/5 text-white/40"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreate} disabled={loading}
            className="w-full py-2.5 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] font-medium hover:bg-green-400/15 disabled:opacity-40 transition-all">
            {loading ? "Creating..." : "Create Community"}
          </button>
        </div>
      </div>
    </div>
  );
}