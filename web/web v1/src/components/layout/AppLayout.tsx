import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // La appweb de Ecuaplac es un portal autónomo White-Label para el cliente final
  const isEcuaplacPortal =
    location.pathname.startsWith('/app/ecuaplac') ||
    location.pathname === '/ecuaplac' ||
    location.pathname === '/';

  if (isEcuaplacPortal) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] w-full max-w-full overflow-x-clip">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas flex w-full max-w-full overflow-x-hidden">
      {/* Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden">
        <AppHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1600px] w-full min-w-0 mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

