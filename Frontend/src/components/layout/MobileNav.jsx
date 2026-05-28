import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Home, TrendingUp, Compass,
  Users, User, Bell, Search, Calendar, PlusSquare, LogOut, Settings
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import SearchPanel from "./SearchPanel";
import NotificationsPanel from "./NotificationsPanel";
import CreatePostModal from "../feed/CreatePostModal";
import { logoutApi } from "../../api/authApi";
import { toast } from "sonner";

const bottomNav = [
  { icon: Home,       label: "Home",        path: "/" },
  { icon: TrendingUp, label: "Popular",     path: "/popular" },
  { icon: PlusSquare, label: "Create",      path: null, panel: "create" },
  { icon: Compass,    label: "Explore",     path: "/explore" },
  { icon: Users,      label: "Communities", path: "/communities" },
];

const topRight = [
  { icon: Search,   panel: "search" },
  { icon: Calendar, path: "/events" },
  { icon: Bell,     panel: "notifications" },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#030403] border-b border-white/5 md:hidden">
        <Link to="/" className="text-xl font-black tracking-tight text-white">
          MATRIX
        </Link>
        <div className="flex items-center gap-1">
          {topRight.map(({ icon: Icon, path, panel }) => {
            const active = path ? pathname === path : activePanel === panel;
            return panel ? (
              <button
                key={panel}
                onClick={() => setActivePanel(activePanel === panel ? null : panel)}
                className={`p-2 rounded-xl transition-all ${
                  active ? "text-green-400 bg-green-400/10" : "text-white/40 hover:text-white"
                }`}
              >
                <Icon size={20} />
              </button>
            ) : (
              <Link
                key={path}
                to={path}
                className={`p-2 rounded-xl transition-all ${
                  pathname === path ? "text-green-400 bg-green-400/10" : "text-white/40 hover:text-white"
                }`}
              >
                <Icon size={20} />
              </Link>
            );
          })}

            <Link to={`/profile/${user?.userName}`} className="ml-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-[12px] font-bold text-black overflow-hidden">
                    {user?.profilePic?.url
                    ? <img src={user.profilePic.url} className="w-full h-full object-cover" alt="" />
                    : user?.userName?.[0]?.toUpperCase()
                    }
                </div>
            </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#030403] border-t border-white/5 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNav.map(({ icon: Icon, label, path, panel }) => {
            const active = path ? pathname === path : activePanel === panel;
            return panel ? (
              <button
                key={label}
                onClick={() => setActivePanel(activePanel === panel ? null : panel)}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                  active ? "text-green-400" : "text-white/30 hover:text-white"
                }`}
              >
                <Icon size={22} />
              </button>
            ) : (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                  pathname === path ? "text-green-400" : "text-white/30 hover:text-white"
                }`}
              >
                <Icon size={22} />
              </Link>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                showProfileMenu ? "text-green-400" : "text-white/30 hover:text-white"
              }`}
            >
              <User size={22} />
            </button>

            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div
                  className="absolute bottom-full right-0 mb-3 w-48 rounded-2xl overflow-hidden shadow-2xl z-50"
                  style={{
                    background: "rgba(12,15,12,0.98)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-[13px] font-medium text-white/85 truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-white/30 truncate">@{user?.userName}</p>
                  </div>

                  <Link
                    to={`/profile/${user?.userName}`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <User size={14} />
                    View Profile
                  </Link>

                  <div className="border-t border-white/5" />
                   <Link
                    to="/settings"
                    onClick={() => setShowLogout(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                    <Settings size={14} />
                    Settings
                    </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                   
                  
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {activePanel === "search" && (
        <div className="fixed inset-0 z-50 md:hidden"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setActivePanel(null)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden"
            style={{
              background: "rgba(12,15,12,0.98)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              height: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SearchPanel onClose={() => setActivePanel(null)} />
          </div>
        </div>
      )}

      {activePanel === "notifications" && (
        <div className="fixed inset-0 z-50 md:hidden"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setActivePanel(null)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden"
            style={{
              background: "rgba(12,15,12,0.98)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              height: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <NotificationsPanel onClose={() => setActivePanel(null)} />
          </div>
        </div>
      )}

      {activePanel === "create" && (
        <CreatePostModal
          onClose={() => setActivePanel(null)}
          onPostCreated={() => setActivePanel(null)}
        />
      )}
    </>
  );
}