
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import PoliticiansList from "./pages/PoliticiansList";
import PoliticianDetail from "./pages/PoliticianDetail";
import CountiesList from "./pages/CountiesList";
import PartiesList from "./pages/PartiesList";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import AuthPage from "./pages/auth/AuthPage";
import { AuthProvider } from "./context/AuthContext";
import React from 'react';

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/politicians" element={<PoliticiansList />} />
              <Route path="/politicians/:id" element={<PoliticianDetail />} />
              <Route path="/counties" element={<CountiesList />} />
              <Route path="/parties" element={<PartiesList />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
