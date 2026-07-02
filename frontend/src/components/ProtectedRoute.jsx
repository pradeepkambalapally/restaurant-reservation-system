import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route by auth + role. If logged in but wrong role,
// redirect to their correct dashboard instead of just blocking them —
// e.g. an admin hitting "/" gets bounced to "/admin" automatically.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin' : '/';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;