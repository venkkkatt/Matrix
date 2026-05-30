import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/axios";
import useAuthStore from "@/store/authStore";

export default function Rightpanel() {
  const [events, setEvents] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [following, setFollowing] = useState([]);
  const {user: currentUser, login} = useAuthStore();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get("/users/suggestions");
        setSuggestions(res.data.users || []);
      } catch {
        toast.error("Failed to load suggestions")
      }
       finally {
        setSuggestionsLoading(false);
       }
    };
    fetchSuggestions();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/follow/${userId}`);
          const updatedFollowing = currentUser.following.includes(userId)
      ? currentUser.following.filter((id) => id !== userId)
      : [...currentUser.following, userId];

    login({
      ...currentUser,
      following: updatedFollowing,
    });

    setSuggestions((prev) =>
      prev.filter((u) => u._id !== userId)
    );

    } catch {
      toast.error("Failed to follow");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        const upcomingEvents = (res.data.events || [])
        .filter(  (event) => new Date(event.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(upcomingEvents);
      }
      catch (error) {
        console.log(error)
        toast.error("Events not displayed")
      }
    };
    fetchEvents();
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/posts/popular");
        setPopularPosts((res.data.posts || []).slice(0, 3));
      } catch {}
    };
    fetchData();
  }, []);

  return (
    <aside className="sticky bg-[#010101] min-w-75 h-[100vh] overflow-y-auto border-white/5 px-3 py-4">     

      <div className="border-t border-white/5 pt-4">
        <p className="text-[13px] tracking-widest uppercase text-white/25 mb-3 px-1">
          Upcoming events
        </p>
        <div className="flex flex-col gap-2">
            {events.length > 0 ? (
  events.map((ev) => (
    <div
      key={ev._id}
      className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-green-400/20 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-white/85 truncate">
            {ev.title}
          </p>

          <p className="text-[11px] text-white/35 mt-0.5">
            {new Date(ev.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="px-2 py-1 rounded-full bg-green-400/10 text-[10px] text-green-400 shrink-0">
          {ev.category}
        </div>
      </div>

      {ev.description && (
        <p className="text-[11px] text-white/40 mt-2 line-clamp-2 leading-relaxed">
          {ev.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-green-500/20 shrink-0">
            {ev.organizer?.profilePic?.url ? (
              <img
                src={ev.organizer.profilePic.url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-green-400">
                {ev.organizer?.userName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <p className="text-[11px] text-white/35 truncate">
            @{ev.organizer?.userName}
          </p>
        </div>

        <p className="text-[10px] text-white/25 truncate">
          {ev.location}
        </p>
      </div>
    </div>
  ))
) : (
  <div className="text-[12px] text-white/25 px-1">
    No upcoming events
  </div>
)}
        </div>
      </div>
      <p className="text-[13px] mt-4 tracking-widest uppercase text-white/25 mb-3 px-1">
        Popular posts
      </p>

      <div className="flex flex-col gap-2 mb-5">
        {popularPosts.length > 0 ? popularPosts.map((post) => (
          <div key={post._id} className="flex gap-2 p-2 rounded-lg bg-white/2 border border-white/5 cursor-pointer hover:border-white/10 transition-all">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-[12px] font-bold text-black shrink-0 overflow-hidden">
              {post.author?.profilePic?.url
                ? <img src={post.author.profilePic.url} className="w-full h-full object-cover" alt="" />
                : post.author?.userName?.[0]?.toUpperCase()
              }
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white/85 truncate">{post.author?.fullName}</p>
              <p className="text-[12px] text-white/30 truncate leading-relaxed">{post.caption}</p>
            </div>
          </div>
        )) : (
          [1,2,3].map((i) => (
            <div key={i} className="flex gap-2 p-2 rounded-lg bg-white/2 border border-white/5 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 bg-white/5 rounded w-2/3" />
                <div className="h-2 bg-white/5 rounded w-full" />
              </div>
            </div>
          ))
        )}
      </div>
     
      <p className="text-[13px] my-5 tracking-widest uppercase text-white/25 mb-3 px-1">
        Who to follow
      </p>
       {suggestionsLoading ? (
          [..."APRS"].map((letter, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-lg animate-pulse"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 bg-white/5 rounded w-3/4" />
                <div className="h-2 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : suggestions.length > 0 ? (
          suggestions.map((u) => (
            <Link key={u._id} to={`/profile/${u.userName}`}>
            <SuggestionCard
              user={u}
              isFollowing={following.includes(u._id)}
              onFollow={() => handleFollow(u._id)}
            />
            </Link>
          ))
        ) : (
          <p className="text-[12px] text-white/25 px-1">
            No suggestions available
          </p>
        )}
              

      <p className="text-[10px] text-white/15 text-center mt-6">Matrix © 2026</p>
    </aside>
  );
}

function SuggestionCard({ user, isFollowing, onFollow }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/3 transition-all group">
      <div className="w-8 h-8 rounded-[50%] bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-[11px] font-bold text-black shrink-0 overflow-hidden">
        {user.profilePic?.url
          ? <img src={user.profilePic.url} className="w-full h-full object-cover" alt="" />
          : user.userName?.[0]?.toUpperCase()
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-white/85 truncate group-hover:text-green-400 transition-colors">
          {user.fullName}
        </p>
        <p className="text-[11px] text-white/30 truncate">
          @{user.userName} {user.dept && `· ${user.dept}`}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFollow();
        }}
        className={`text-[10px] px-2 py-1 rounded-full items-center border shrink-0 transition-all ${
          isFollowing
            ? "border-white/10 text-white/30"
            : "border-green-400/30 text-green-400 hover:bg-green-400/10"
        }`}
      >
        {isFollowing ? "✓" : "+"}
      </button>
    </div>
  );
}