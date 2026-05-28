import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import RightPanel from "./Rightpanel";
import MobileNav from "./MobileNav";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex font-array min-h-screen bg-[#000000] text-white">
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${collapsed ? "w-[70px]" : "w-[250px]"}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <main className="flex-1 min-h-screen pt-14 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block shrink-0"><RightPanel /></div>
      
      <MobileNav />
    </div>
  );
}