import { Link } from "react-router-dom";

export default function Avatar({ user, size = 9, clickable = false }) {
  const sizeMap = {
    7: "w-7 h-7 text-[10px]",
    8: "w-8 h-8 text-[11px]",
    9: "w-9 h-9 text-[12px]",
    10: "w-10 h-10 text-[13px]",
    12: "w-12 h-12 text-[15px]",
    14: "w-14 h-14 text-[17px]",
  };

  const classes = `${sizeMap[size] || "w-9 h-9 text-[12px]"} rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center font-bold text-black shrink-0 overflow-hidden`;

  const inner = (
    <div className={classes}>
      {user?.profilePic?.url
        ? <img src={user.profilePic.url} className="w-full h-full object-cover" alt="" />
        : <span>{user?.userName?.[0]?.toUpperCase()}</span>
      }
    </div>
  );

  if (clickable && user?.userName) {
    return (
      <Link to={`/profile/${user.userName}`} onClick={(e) => e.stopPropagation()}>
        {inner}
      </Link>
    );
  }

  return inner;
}