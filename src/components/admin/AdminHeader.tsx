
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';

interface AdminHeaderProps {
  className?: string;
  onToggleSidebar: () => void;
}

export function AdminHeader({ className = "", onToggleSidebar }: AdminHeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex h-full items-center px-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-4">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="font-bold text-xl flex-1">Admin Dashboard</div>

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
