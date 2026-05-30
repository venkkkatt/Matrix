import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import useAuthStore from "../../store/authStore";
import CreatePostModal from "../feed/CreatePostModal";
import { logoutApi } from "../../api/authApi";
import SearchPanel from "./SearchPanel";
import NotificationsPanel from "./NotificationsPanel";
import { Settings } from "lucide-react";


import {
  Home, Search, Compass, TrendingUp,
  Users, BookOpen, Calendar, Bell,
  User, PlusSquare, LogOut, ChevronUp, ChevronRight, ChevronLeft
} from "lucide-react";


export default function Sidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const popupRef = useRef(null)
  const [activePanel, setActivePanel] = useState(null);
  
  const navGroups = [
  {
    items: [
      { icon: PlusSquare, label: "Create",       path: "null", panel: "create" },
      { icon: Search,     label: "Search",        path: "null", panel: "search" },
    ]
  },
  {
    items: [
      { icon: Home,       label: "Feed",          path: "/" },
      { icon: Compass,    label: "Explore",       path: "/explore" },
      { icon: TrendingUp, label: "Popular",       path: "/popular" },
    ]
  },
  {
    items: [
      { icon: Users,      label: "Communities",   path: "/communities" },
      // { icon: BookOpen,   label: "Clubs",         path: "/clubs" },
      { icon: Calendar,   label: "Events",        path: "/events" },
      // { icon: ShoppingBag,label: "Marketplace",   path: "/marketplace" },
    ]
  },
  {
    items: [
      { icon: Bell,       label: "Notifications", path: "null", panel: "notifications" },
      { icon: Settings,       label: "Settings",       path: `/settings` },
    ]
  },
];
 
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.target)
    ) {
      setShowLogout(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);
   const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      toast.success("Logged out!");
      navigate("/login");
    } catch {
      logout();
      navigate("/login");
    }
  };

  if (activePanel === "search") {
    return (
      <aside className="sticky top-0 h-screen bg-[#030403] flex flex-col overflow-y-auto border-white/5">
        <SearchPanel onClose={() => setActivePanel(null)} />
      </aside>
    );
  }

  if (activePanel === "notifications") {
    return (
      <aside className="sticky top-0 h-screen bg-[#030403] flex flex-col overflow-y-auto border-white/5">
        <NotificationsPanel onClose={() => setActivePanel(null)} />
      </aside>
    );
  }

  if (activePanel === "create") {
    return (
      <>
        <aside className="sticky top-0 h-screen bg-[#030403] flex flex-col px-3 py-5 overflow-y-auto border-white/5">
          <Link to="/" className={`font-array tracking-tight text-white px-2 mb-6 ${collapsed ? "text-xl" : "text-2xl lg:text-3xl"}`}>
            {collapsed ? "M" : "MATRIX"}
          </Link>
          <nav className="flex-1 flex flex-col gap-4">
            {navGroups.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-0.5">
                {group.items.map(({ icon: Icon, label, path, panel }) => (
                  panel ? (
                    <button key={label} onClick={() => setActivePanel(panel)}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] font-medium text-white/35 hover:text-white hover:bg-white/4 transition-all w-full">
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span>{label}</span>}
                    </button>
                  ) : (
                    <Link key={path} to={path}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] font-medium text-white/35 hover:text-white hover:bg-white/4 transition-all">
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  )
                ))}
                {gi < navGroups.length - 1 && <div className="border-t border-white/5 mt-2" />}
              </div>
            ))}
          </nav>
        </aside>
        <CreatePostModal
          onClose={() => setActivePanel(null)}
          onPostCreated={() => { setActivePanel(null); toast.success("Post created!"); }}
        />
      </>
    );
  }

  return (
    <aside className="sticky top-0 h-screen bg-[#030403] flex flex-col px-3 py-5 overflow-hidden border-white/5 relative">

      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#030403] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all z-10"
      >
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />
        }
      </button>

      <Link to="/" className={`font-array font-black tracking-tight text-white px-2 mb-6 transition-all ${collapsed ? "text-xl" : "text-2xl lg:text-3xl"}`}>
        {collapsed ? "M" : "MATRIX"}
      </Link>

      <nav className="flex-1 flex flex-col gap-4">
        {navGroups.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {group.items.map(({ icon: Icon, label, path, panel }) => {
              const active = path ? pathname === path : activePanel === panel;
              return panel ? (
                <button
                  key={label}
                  onClick={() => setActivePanel(panel)}
                  title={collapsed ? label : ""}
                  className={`flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] font-medium transition-all w-full ${
                    active
                      ? "text-green-400 bg-green-400/8 border border-green-400/15"
                      : "text-white/35 hover:text-white hover:bg-white/4"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </button>
              ) : (
                <Link
                  key={path}
                  to={path}
                  title={collapsed ? label : ""}
                  className={`flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    active
                      ? "text-green-400 bg-green-400/8 border border-green-400/15"
                      : "text-white/35 hover:text-white hover:bg-white/4"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
            {gi < navGroups.length - 1 && (
              <div className="border-t border-white/5 mt-2" />
            )}
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-white/5 pt-4">
        {user && (
          <div className="relative" ref={popupRef}>
            <div
              onClick={() => setShowLogout(!showLogout)}
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/3 border border-white/5 cursor-pointer hover:border-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-[12px] font-bold text-black shrink-0 overflow-hidden">
                {user.profilePic?.url
                  ? <img src={user.profilePic.url} className="w-full h-full object-cover" alt="" />
                  : user.userName?.[0]?.toUpperCase()
                }
              </div>
              {!collapsed && (
                <div className="flex flex-1 min-w-0 items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-white/80 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-white/30 truncate">@{user.userName}</p>
                  </div>
                  <ChevronUp
                    size={14}
                    className={`text-white/25 shrink-0 transition-transform duration-200 ${showLogout ? "" : "rotate-180"}`}
                  />
                </div>
              )}
            </div>

            {showLogout && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "rgba(15,18,15,0.97)", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <Link
                  to={`/profile/${user.userName}`}
                  onClick={() => setShowLogout(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <User size={14} />
                  {!collapsed && "View Profile"}
                </Link>
                <div className="border-t border-white/5" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-400 hover:bg-red-500/8 transition-all"
                >
                  <LogOut size={14} />
                  {!collapsed && "Logout"}
                </button>
              </div>
              
            )}
           
          </div>
        )}
      </div>
    </aside>
  );
}