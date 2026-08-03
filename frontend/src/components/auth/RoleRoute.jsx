import { Navigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            setIsChecking(false);
        }
    }, [loading]);

    if (isChecking || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to a safe page based on role
        if (user.role === 'owner') return <Navigate to="/dashboard" replace />;
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleRoute;
