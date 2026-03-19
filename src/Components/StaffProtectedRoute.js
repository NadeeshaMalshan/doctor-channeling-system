import { Navigate } from 'react-router-dom';

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Date.now() / 1000;
    } catch {
        return true;
    }
};

const StaffProtectedRoute = ({ element, allowedRoles }) => {
    const token = localStorage.getItem('staffToken');
    const user = JSON.parse(localStorage.getItem('staffUser') || 'null');

    if (!token || !user || isTokenExpired(token)) {
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        return <Navigate to="/ecare/staff-login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/ecare/staff-login" replace />;
    }

    return element;
};

export default StaffProtectedRoute;
