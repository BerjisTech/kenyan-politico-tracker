import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { RoleGuard } from "./components/RoleGuard";
import { ThemeProvider } from "./components/ThemeProvider";
import { AdminLayout } from "./components/admin/AdminLayout";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import DashboardRedirect from "@/pages/DashboardRedirect";
import Dashboard from "@/pages/Dashboard";
import PoliticiansList from "@/pages/PoliticiansList";
import PoliticianDetail from "@/pages/PoliticianDetail";
import CountiesList from "@/pages/CountiesList";
import PartiesList from "@/pages/PartiesList";
import SearchResults from "@/pages/SearchResults";
import Community from "@/pages/Community";
import PoliticiansManagement from "@/pages/admin/PoliticiansManagement";
import CountiesManagement from "@/pages/admin/CountiesManagement";
import PartiesManagement from "@/pages/admin/PartiesManagement";
import ProjectsManagement from "@/pages/admin/ProjectsManagement";
import UserManagement from "@/pages/admin/UserManagement";
import CommunityManagement from "@/pages/admin/CommunityManagement";
import SubCountiesManagement from "@/pages/admin/SubCountiesManagement";
import WardsManagement from "@/pages/admin/WardsManagement";
import PoliticianCreate from "@/pages/forms/PoliticianCreate";
import PoliticianEdit from "@/pages/forms/PoliticianEdit";
import AuthPage from "@/pages/auth/AuthPage";
import AuthCallback from "@/pages/auth/AuthCallback";

// Community Pages
import CommunityHome from "@/pages/community/CommunityHome";
import PopularTopics from "@/pages/community/PopularTopics";
import NewTopics from "@/pages/community/NewTopics";
import TopTopics from "@/pages/community/TopTopics";
import TopicPage from "@/pages/community/TopicPage";
import PostCreate from "@/pages/community/PostCreate";
import Communities from "@/pages/community/Communities";
import Following from "@/pages/community/Following";
import Topics from "@/pages/community/Topics";
import Notifications from "@/pages/community/Notifications";
import Messages from "@/pages/community/Messages";
import UserSettings from "@/pages/community/UserSettings";
import CommunitySettings from "@/pages/community/CommunitySettings";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="politicians" element={<PoliticiansList />} />
            <Route path="politicians/:id" element={<PoliticianDetail />} />
            <Route path="counties" element={<CountiesList />} />
            <Route path="parties" element={<PartiesList />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="community" element={<Community />}>
              <Route index element={<CommunityHome />} />
              <Route path="popular" element={<PopularTopics />} />
              <Route path="new" element={<NewTopics />} />
              <Route path="top" element={<TopTopics />} />
              <Route path="communities" element={<Communities />} />
              <Route path="following" element={<Following />} />
              <Route path="topics" element={<Topics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<UserSettings />} />
              <Route path="settings/community" element={<CommunitySettings />} />
              <Route path="topic/:id" element={<TopicPage />} />
              <Route path="post/new" element={<PostCreate />} />
            </Route>
            <Route path="auth" element={<AuthPage />} />
            <Route path="auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            path="/dashboard-redirect"
            element={<DashboardRedirect />}
          />

          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={["superadmin", "admin"]}>
                <AdminLayout />
              </RoleGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="politicians" element={<PoliticiansManagement />} />
            <Route path="counties" element={<CountiesManagement />} />
            <Route path="sub-counties" element={<SubCountiesManagement />} />
            <Route path="wards" element={<WardsManagement />} />
            <Route path="parties" element={<PartiesManagement />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="community" element={<CommunityManagement />} />

            <Route path="politicians/create" element={<PoliticianCreate />} />
            <Route path="politicians/edit/:id" element={<PoliticianEdit />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </ThemeProvider>
  );
}
