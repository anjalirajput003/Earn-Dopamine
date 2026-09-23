import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      <Topbar sidebarCollapsed={sidebarCollapsed} />

      <main
        className={`min-h-screen pt-16 transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[240px]"
        }`}
      >
        <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
