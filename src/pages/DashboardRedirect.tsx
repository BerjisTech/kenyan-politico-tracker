
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  useEffect(() => {
    // Redirect based on user role
    if (userRole === 'admin' || userRole === 'superadmin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  }, [navigate, userRole]);
  
  return (
    <div className="container py-10 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}
