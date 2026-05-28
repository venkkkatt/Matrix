import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import { Calendar, Plus, X, MapPin, Clock } from "lucide-react";
import useAuthStore from "../store/authStore";
import { formatDistanceToNow, format, isPast } from "date-fns";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [rsvped, setRsvped] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.events);
      const myRsvp = res.data.events
        .filter((e) => e.rsvp.some((r) => r === user._id || r._id === user._id))
        .map((e) => e._id);
      setRsvped(myRsvp);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId) => {
    try {
      const res = await api.put(`/events/${eventId}/rsvp`);
      setRsvped((prev) =>
        res.data.going
          ? [...prev, eventId]
          : prev.filter((id) => id !== eventId)
      );
      toast.success(res.data.going ? "You're going!" : "RSVP removed");
    } catch {
      toast.error("Failed to RSVP");
    }
  };

  const upcoming = events.filter((e) => !isPast(new Date(e.date)));
  const past = events.filter((e) => isPast(new Date(e.date)));

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
          <h1 className="text-2xl font-black tracking-tight">Events</h1>
          <p className="text-[13px] text-white/25 mt-0.5">{upcoming.length} upcoming events</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] font-medium hover:bg-green-400/15 transition-all"
        >
          <Plus size={15} />
          Create
        </button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-green-400" />
            <h2 className="text-[14px] font-semibold text-white/70 uppercase tracking-widest">Upcoming</h2>
          </div>
          <div className="space-y-3">
            {upcoming.map((e) => (
              <EventCard key={e._id} event={e} isGoing={rsvped.includes(e._id)} onRsvp={() => handleRsvp(e._id)} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-white/30" />
            <h2 className="text-[14px] font-semibold text-white/30 uppercase tracking-widest">Past Events</h2>
          </div>
          <div className="space-y-3 opacity-50">
            {past.map((e) => (
              <EventCard key={e._id} event={e} isGoing={rsvped.includes(e._id)} onRsvp={() => {}} isPast />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-white/30 text-[14px]">No events yet</p>
          <p className="text-white/20 text-[13px] mt-1">Create the first event!</p>
        </div>
      )}

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={(e) => { setEvents((prev) => [...prev, e]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

function EventCard({ event, isGoing, onRsvp, isPast }) {
  const categoryColors = {
    technical: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    cultural: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    sports: "text-red-400 bg-red-400/10 border-red-400/20",
    social: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    other: "text-green-400 bg-green-400/10 border-green-400/20",
  };

  return (
    <div className="rounded-2xl p-4 transition-all hover:scale-[1.005]"
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-semibold text-white/90 truncate">{event.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${categoryColors[event.category] || categoryColors.other}`}>
              {event.category}
            </span>
          </div>
          {event.description && (
            <p className="text-[12px] text-white/40 leading-relaxed mb-2 line-clamp-2">{event.description}</p>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-white/30">
              <Calendar size={12} />
              {format(new Date(event.date), "MMM d, yyyy · h:mm a")}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                <MapPin size={12} />
                {event.location}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-[9px] font-bold text-black overflow-hidden">
              {event.organizer?.profilePic?.url
                ? <img src={event.organizer.profilePic.url} className="w-full h-full object-cover" alt="" />
                : event.organizer?.userName?.[0]?.toUpperCase()
              }
            </div>
            <p className="text-[11px] text-white/25">by @{event.organizer?.userName}</p>
            <p className="text-[11px] text-white/20 ml-auto">{event.rsvp.length} going</p>
          </div>
        </div>

        {!isPast && (
          <button
            onClick={onRsvp}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all ${
              isGoing
                ? "bg-green-400/10 border-green-400/20 text-green-400"
                : "border-white/10 text-white/40 hover:border-green-400/30 hover:text-green-400"
            }`}
          >
            {isGoing ? "✓ Going" : "RSVP"}
          </button>
        )}
      </div>
    </div>
  );
}

function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", category: "other" });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.date) { toast.error("Title and date are required"); return; }
    try {
      setLoading(true);
      const res = await api.post("/events/create", form);
      toast.success("Event created!");
      onCreated(res.data.event);
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
          <h2 className="text-[15px] font-semibold">Create Event</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: "title", label: "Title", placeholder: "Event name", type: "text" },
            { key: "location", label: "Location", placeholder: "Where is it?", type: "text" },
            { key: "date", label: "Date & Time", placeholder: "", type: "datetime-local" },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-[12px] text-white/40 mb-1.5 block uppercase tracking-widest">{label}</label>
              <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-white/4 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none border border-white/5 focus:border-green-400/30 transition-colors [color-scheme:dark]" />
            </div>
          ))}
          <div>
            <label className="text-[12px] text-white/40 mb-1.5 block uppercase tracking-widest">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell people about this event" rows={3}
              className="w-full bg-white/4 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none border border-white/5 focus:border-green-400/30 transition-colors resize-none" />
          </div>
          <div>
            <label className="text-[12px] text-white/40 mb-1.5 block uppercase tracking-widest">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {["technical", "cultural", "sports", "social", "other"].map((cat) => (
                <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                  className={`py-2 rounded-xl text-[12px] capitalize transition-all ${
                    form.category === cat
                      ? "bg-green-400/10 border border-green-400/20 text-green-400"
                      : "bg-white/3 border border-white/5 text-white/40"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreate} disabled={loading}
            className="w-full py-2.5 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-[13px] font-medium hover:bg-green-400/15 disabled:opacity-40 transition-all">
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}