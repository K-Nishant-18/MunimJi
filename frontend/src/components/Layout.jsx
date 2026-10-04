import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#f4f6fa]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {/* Re-mount on route change so every page fades up */}
        <main className="flex-1 p-4 md:p-7">
          <div key={location.pathname} className="mx-auto max-w-[1400px] animate-fadeUp">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
