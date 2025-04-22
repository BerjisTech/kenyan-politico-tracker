
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import PoliticiansList from "./pages/PoliticiansList";
import PoliticianDetail from "./pages/PoliticianDetail";
import PartiesList from "./pages/PartiesList";
import CountiesList from "./pages/CountiesList";
import SearchResults from "./pages/SearchResults";
import AuthPage from "./pages/auth/AuthPage";
import AuthCallback from "./pages/auth/AuthCallback";
import { RoleGuard } from "./components/RoleGuard";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PoliticiansManagement from "./pages/admin/PoliticiansManagement";
import PartiesManagement from "./pages/admin/PartiesManagement";
import CountiesManagement from "./pages/admin/CountiesManagement";
import SubCountiesManagement from "./pages/admin/SubCountiesManagement";
import WardsManagement from "./pages/admin/WardsManagement";
import ProjectsManagement from "./pages/admin/ProjectsManagement";
import UserManagement from "./pages/admin/UserManagement";
import NotFound from "./pages/NotFound";
import PoliticianCreate from "./pages/forms/PoliticianCreate";
import PoliticianEdit from "./pages/forms/PoliticianEdit";
import Community from "./pages/Community";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="politicians" element={<PoliticiansList />} />
          <Route path="politicians/:id" element={<PoliticianDetail />} />
          <Route path="parties" element={<PartiesList />} />
          <Route path="counties" element={<CountiesList />} />
          <Route path="counties/:id" element={<CountiesList />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="community" element={<Community />} />
        </Route>

        <Route path="/add-politician" element={<PoliticianCreate />} />
        <Route path="/edit-politician/:id" element={<PoliticianEdit />} />

        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['admin', 'superadmin']}>
              <AdminLayout />
            </RoleGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="politicians" element={<PoliticiansManagement />} />
          <Route path="parties" element={<PartiesManagement />} />
          <Route path="counties" element={<CountiesManagement />} />
          <Route path="counties/:countyId/subcounties" element={<SubCountiesManagement />} />
          <Route path="subcounties/:subCountyId/wards" element={<WardsManagement />} />
          <Route path="projects" element={<ProjectsManagement />} />
          <Route
            path="users"
            element={
              <RoleGuard allowedRoles={['superadmin']}>
                <UserManagement />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
      <SonnerToaster position="top-center" />
    </ThemeProvider>
  );
}
