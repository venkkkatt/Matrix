import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import RightPanel from "./RightPanel";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* <Sidebar /> */}
      <main className="flex-1 ml-64 mr-80 min-h-screen border-x border-gray-800">
        <Outlet />
      </main>
      {/* <RightPanel /> */}
    </div>
  );
}