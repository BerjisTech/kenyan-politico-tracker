
import { Outlet } from 'react-router-dom';
import { CommunitySidebar } from '@/components/community/CommunitySidebar';
import { CommunityRightSidebar } from '@/components/community/CommunityRightSidebar';

export default function Community() {
  return (
    <div className="min-h-screen bg-background">
      <CommunitySidebar />
      <div className="pl-60 pr-[280px]">
        <Outlet />
      </div>
      <CommunityRightSidebar />
    </div>
  );
}
