import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '4px solid #ea580c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
