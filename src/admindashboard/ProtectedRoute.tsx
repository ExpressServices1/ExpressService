import React from 'react';
import { Navigate } from 'react-router-dom';

const isAdminAuthenticated = () => {
    const token = localStorage.getItem('admin_token');
    const expiry = localStorage.getItem('admin_token_expiry');
    if (!token || !expiry) return false;
    return Date.now() < Number(expiry);
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAdminAuthenticated()) {
        return <Navigate to="/admindashboard/index" replace />;
    }
    return <>{children}</>;
};

export default ProtectedRoute;