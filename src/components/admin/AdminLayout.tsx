
import React, { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AdminLayoutProps {
  className?: string;
}

export function AdminLayout({ className = "" }: AdminLayoutProps) {
  const [isSideBarCollapsed, setIsSideBarCollapsed] = useState(false);
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Prevent showing "signed in successfully" toast when in admin pages
  useEffect(() => {
    // Clear any pending toasts to prevent "signed in successfully" showing on refresh
    toast.dismiss();
  }, []);

  const toggleSidebar = () => {
    setIsSideBarCollapsed(prev => !prev);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to home if authenticated but not admin/superadmin
  if (!['admin', 'superadmin'].includes(userRole || '')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 ${className}`}>
      <AdminHeader className="h-[70px] w-screen" onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <AdminSidebar 
          className={`${isSideBarCollapsed ? 'show-only-icons w-[50px]' : 'show-full-menu-item w-[300px]'} flex-col gap-3`}
          collapsed={isSideBarCollapsed}
        />
        <div className={`${isSideBarCollapsed ? 'w-[calc(100vw-50px)]' : 'w-[calc(100vw-300px)]'} h-[calc(100vh-70px)] overflow-y-auto overflow-x-hidden`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
