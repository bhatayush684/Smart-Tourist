import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'tourist' | 'admin' | 'police' | 'id_issuer';
  requiredRoles?: ('tourist' | 'admin' | 'police' | 'id_issuer')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, requiredRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user account is pending approval
  if (user?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-yellow-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-4">
            Your {user.role?.replace('_', ' ')} account is currently under review by our administrators.
            You'll receive an email notification once your account is approved.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-primary hover:underline font-medium"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Check if user account is suspended
  if (user?.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Suspended</h1>
          <p className="text-muted-foreground mb-4">
            Your account has been suspended. Please contact support for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-primary hover:underline font-medium"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  const hasAccess = () => {
    if (!user?.role) return false;
    
    if (requiredRole) {
      return user.role === requiredRole;
    }
    
    if (requiredRoles) {
      return requiredRoles.includes(user.role);
    }
    
    return true;
  };

  if (!hasAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page. This area is restricted to {requiredRole || requiredRoles?.join(', ')} users only.
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
