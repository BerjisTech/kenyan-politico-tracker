
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Flag, Map, Briefcase, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  className?: string;
  collapsed?: boolean;
}

export function AdminSidebar({ className = "", collapsed = false }: AdminSidebarProps) {
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === 'superadmin';
  
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      roles: ['admin', 'superadmin']
    },
    {
      name: "Politicians",
      path: "/admin/politicians",
      icon: User,
      roles: ['admin', 'superadmin']
    },
    {
      name: "Counties",
      path: "/admin/counties",
      icon: Map,
      roles: ['admin', 'superadmin']
    },
    {
      name: "Parties",
      path: "/admin/parties",
      icon: Flag,
      roles: ['admin', 'superadmin']
    },
    {
      name: "Projects",
      path: "/admin/projects",
      icon: Briefcase,
      roles: ['admin', 'superadmin']
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: Settings,
      roles: ['superadmin']
    }
  ];
  
  return (
    <aside className={`border-r border-border bg-background h-[calc(100vh-70px)] ${className}`}>
      <nav className="flex flex-col p-2 space-y-1">
        {navItems
          .filter(item => item.roles.includes(userRole || ''))
          .map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  collapsed ? "justify-center" : ""
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
