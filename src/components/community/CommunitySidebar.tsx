
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, TrendingUp, Star, Users, Hash, MessageSquare,
  Bell, UserCog, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommunitySidebar() {
  const location = useLocation();
  
  const menuItems = [
    { label: 'Home', icon: Home, href: '/community' },
    { label: 'Popular', icon: TrendingUp, href: '/community/popular' },
    { label: 'New', icon: Star, href: '/community/new' },
    { label: 'Top', icon: TrendingUp, href: '/community/top' },
  ];

  const feedItems = [
    { label: 'Communities', icon: Users, href: '/community/communities' },
    { label: 'Following', icon: Users, href: '/community/following' },
    { label: 'Topics', icon: Hash, href: '/community/topics' },
  ];

  const userItems = [
    { label: 'Notifications', icon: Bell, href: '/community/notifications' },
    { label: 'Messages', icon: MessageSquare, href: '/community/messages' },
    { label: 'User Settings', icon: UserCog, href: '/community/settings' },
    { label: 'Community Settings', icon: Settings, href: '/community/settings/community' },
  ];

  const MenuSection = ({ title, items }: { title: string, items: any[] }) => (
    <div className="space-y-2">
      <h3 className="text-xs uppercase text-muted-foreground px-4 py-2">{title}</h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm gap-3 w-full hover:bg-accent/50 transition-colors",
              location.pathname === item.href 
                ? "text-primary bg-accent" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="w-60 h-screen bg-card border-r fixed top-14 left-0 p-4 space-y-6 overflow-auto">
      <MenuSection title="MENU" items={menuItems} />
      <MenuSection title="FEEDS" items={feedItems} />
      <MenuSection title="USER" items={userItems} />
    </div>
  );
}
