import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TouristId from './pages/TouristId';
import TouristApp from './pages/TouristApp';
import AdminDashboard from './pages/AdminDashboard';
import IoTMonitor from './pages/IoTMonitor';
import PoliceDashboard from './pages/PoliceDashboard';
import IdVerification from './pages/IdVerification';
import AdminApproval from './pages/AdminApproval';
import NotFound from './pages/NotFound';
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WebSocketProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/tourist-id" element={
                  <ProtectedRoute>
                    <Layout>
                      <TouristId />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/tourist-app" element={
                  <ProtectedRoute>
                    <Layout>
                      <TouristApp />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/iot-monitor" element={
                  <ProtectedRoute requiredRoles={["admin", "police"]}>
                    <Layout>
                      <IoTMonitor />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/police-dashboard" element={
                  <ProtectedRoute requiredRole="police">
                    <Layout>
                      <PoliceDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/id-verification" element={
                  <ProtectedRoute requiredRole="id_issuer">
                    <Layout>
                      <IdVerification />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/approvals" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminApproval />
                    </Layout>
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WebSocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
