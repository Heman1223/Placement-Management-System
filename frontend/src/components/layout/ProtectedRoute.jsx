import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], requireApproval = false }) => {
    const { isAuthenticated, loading, user, isApproved } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Check approval status
    if (requireApproval && !isApproved && user?.role !== 'super_admin') {
        return <Navigate to="/pending-approval" replace />;
    }

    return children;
};

export default ProtectedRoute;
