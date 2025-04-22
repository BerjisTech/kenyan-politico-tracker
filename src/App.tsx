
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import PoliticiansList from "./pages/PoliticiansList";
import PoliticianDetail from "./pages/PoliticianDetail";
import PoliticianCreate from "./pages/forms/PoliticianCreate";
import PoliticianEdit from "./pages/forms/PoliticianEdit";
import CountiesList from "./pages/CountiesList";
import PartiesList from "./pages/PartiesList";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Community from "./pages/Community";
import AuthPage from "./pages/auth/AuthPage";
import AuthCallback from "./pages/auth/AuthCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import PoliticiansManagement from "./pages/admin/PoliticiansManagement";
import ProjectsManagement from "./pages/admin/ProjectsManagement";
import AdminPoliticianForm from "./pages/admin/forms/PoliticianForm";
import { AuthProvider } from "./context/AuthContext";
import { RoleGuard } from "./components/RoleGuard";
import React from 'react';
import { ThemeProvider } from "./components/ThemeProvider";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Public/User Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={
                  <RoleGuard 
                    allowedRoles={['admin', 'superadmin']} 
                    fallback={<Navigate to="/community" replace />}
                  >
                    <Navigate to="/admin" replace />
                  </RoleGuard>
                } />
                <Route path="/community" element={<Community />} />
                <Route path="/politicians" element={<PoliticiansList />} />
                <Route path="/politicians/:id" element={<PoliticianDetail />} />
                <Route path="/counties" element={<CountiesList />} />
                <Route path="/parties" element={<PartiesList />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={
                  <RoleGuard allowedRoles={['admin', 'superadmin']}>
                    <AdminDashboard />
                  </RoleGuard>
                } />
                <Route path="politicians" element={<PoliticiansManagement />} />
                <Route path="politicians/create" element={<AdminPoliticianForm />} />
                <Route path="politicians/edit/:id" element={<AdminPoliticianForm />} />
                <Route path="projects" element={<ProjectsManagement />} />
                <Route path="users" element={
                  <RoleGuard allowedRoles={['superadmin']}>
                    <UserManagement />
                  </RoleGuard>
                } />
              </Route>
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
