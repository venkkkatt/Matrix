import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import RightPanel from "./Rightpanel";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex font-array min-h-screen bg-[#000000] text-white">
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${collapsed ? "w-[70px]" : "w-[250px]"}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <main className="flex-1 border-gray-900">
        <Outlet />
      </main>
      <div className="hidden md:block shrink-0"><RightPanel /></div>
      
    </div>
  );
}