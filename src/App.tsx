
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import PoliticiansList from "./pages/PoliticiansList";
import PoliticianDetail from "./pages/PoliticianDetail";
import PoliticianCreate from "./pages/forms/PoliticianCreate";
import PoliticianEdit from "./pages/forms/PoliticianEdit";
import CountiesList from "./pages/CountiesList";
import PartiesList from "./pages/PartiesList";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import AuthPage from "./pages/auth/AuthPage";
import AuthCallback from "./pages/auth/AuthCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
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
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/politicians" element={<PoliticiansList />} />
                <Route path="/politicians/create" element={<PoliticianCreate />} />
                <Route path="/politicians/:id" element={<PoliticianDetail />} />
                <Route path="/politicians/edit/:id" element={<PoliticianEdit />} />
                <Route path="/counties" element={<CountiesList />} />
                <Route path="/parties" element={<PartiesList />} />
                <Route path="/search" element={<SearchResults />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <RoleGuard allowedRoles={['superadmin', 'admin']}>
                    <AdminDashboard />
                  </RoleGuard>
                } />
                <Route path="/admin/users" element={
                  <RoleGuard allowedRoles={['superadmin']}>
                    <UserManagement />
                  </RoleGuard>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
