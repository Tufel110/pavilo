import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, BusinessType } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedBusinessTypes?: BusinessType[];
    requireAuth?: boolean;
}

/**
 * ProtectedRoute - Wrapper component that protects routes based on:
 * - Authentication status
 * - Business type matching
 */
const ProtectedRoute = ({
    children,
    allowedBusinessTypes,
    requireAuth = true
}: ProtectedRouteProps) => {
    const { user, businessType, loading } = useAuth();

    // Show loading state while fetching auth data
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    // Check authentication
    if (requireAuth && !user) {
        return <Navigate to="/auth" replace />;
    }

    // Check business type if specified
    if (allowedBusinessTypes && allowedBusinessTypes.length > 0) {
        if (!businessType || !allowedBusinessTypes.includes(businessType)) {
            // User doesn't have the right business type, redirect to their correct dashboard
            return <Navigate to="/dashboard" replace />;
        }
    }

    // All checks passed, render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;
