
import { Outlet } from 'react-router-dom';
import { CommunitySidebar } from '@/components/community/CommunitySidebar';

export default function Community() {
  return (
    <div className="min-h-screen bg-background">
      <CommunitySidebar />
      <div className="pl-60">
        <Outlet />
      </div>
    </div>
  );
}
