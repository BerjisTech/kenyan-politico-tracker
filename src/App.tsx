
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { RoleGuard } from "./components/RoleGuard";
import { ThemeProvider } from "./components/ThemeProvider";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLayout from "@/components/admin/AdminLayout";
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
import SubCountiesManagement from "@/pages/admin/SubCountiesManagement";
import WardsManagement from "@/pages/admin/WardsManagement";
import PoliticianCreate from "@/pages/forms/PoliticianCreate";
import PoliticianEdit from "@/pages/forms/PoliticianEdit";
import AuthPage from "@/pages/auth/AuthPage";
import AuthCallback from "@/pages/auth/AuthCallback";

// Community Pages
import CommunityHome from "@/pages/community/CommunityHome";
import TopicPage from "@/pages/community/TopicPage";
import PostCreate from "@/pages/community/PostCreate";

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
              <Route path="topic/:id" element={<TopicPage />} />
              <Route path="post/new" element={<PostCreate />} />
              {/* Add other community routes as needed */}
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

            <Route path="politician/create" element={<PoliticianCreate />} />
            <Route path="politician/edit/:id" element={<PoliticianEdit />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </ThemeProvider>
  );
}
