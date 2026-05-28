import { useEffect, useState } from "react";
import { X, Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Avatar from "../shared/Avatar";

const mockNotifications = [
  { _id: "1", type: "like", text: "liked your post", user: { userName: "brucee", fullName: "Bruce Wayne" }, createdAt: new Date(Date.now() - 1000 * 60 * 5), read: false },
  { _id: "2", type: "comment", text: "commented on your post", user: { userName: "bruceee", fullName: "Bruce" }, createdAt: new Date(Date.now() - 1000 * 60 * 30), read: false },
  { _id: "3", type: "follow", text: "started following you", user: { userName: "mikasa", fullName: "Mikasa Ackerman" }, createdAt: new Date(Date.now() - 1000 * 60 * 60), read: true },
];

const icons = {
  like: <Heart size={13} className="text-green-400" />,
  comment: <MessageCircle size={13} className="text-blue-400" />,
  follow: <UserPlus size={13} className="text-purple-400" />,
};

export default function NotificationsPanel({ onClose }) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex flex-col h-full px-3 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-black tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-green-400 text-black text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[11px] text-green-400/70 hover:text-green-400 transition-colors">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Bell size={28} className="text-white/10 mb-3" />
            <p className="text-[13px] text-white/25">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-all ${
                !n.read ? "bg-green-400/4 border border-green-400/8" : "hover:bg-white/3"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar user={n.user} size={8} />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#030403] flex items-center justify-center">
                  {icons[n.type]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-white/70 leading-relaxed">
                  <span className="font-medium text-white/90">{n.user.fullName}</span>{" "}
                  {n.text}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}