import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * BusinessRouter - Redirects users to their business-specific dashboard
 * based on their business_type from the profiles table
 */
const BusinessRouter = () => {
    const { user, profile, businessType, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Only redirect if we have all the data and user is authenticated
        if (!loading && user && businessType) {
            switch (businessType) {
                case 'shoe_shop':
                    navigate('/shoe-shop', { replace: true });
                    break;
                case 'mini_dmart':
                    navigate('/mini-dmart', { replace: true });
                    break;
                case 'anaj_vyapari':
                    navigate('/anaj-vyapari', { replace: true });
                    break;
                default:
                    // If business type is not set, redirect to subscription/onboarding
                    navigate('/subscription', { replace: true });
            }
        }
    }, [loading, user, businessType, navigate]);

    // Show loading state while fetching profile
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // If no user, redirect to auth
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // If no business type set, redirect to subscription
    if (!businessType) {
        return <Navigate to="/subscription" replace />;
    }

    // Keep showing loading while navigation happens
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default BusinessRouter;
