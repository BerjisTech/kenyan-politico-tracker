
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = userRole === 'superadmin' || userRole === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access the admin dashboard.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Manage the system and users from this central dashboard.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userRole === 'superadmin' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-center py-4">
                <Users className="h-12 w-12 text-primary/80" />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Data Administration</CardTitle>
            <CardDescription>Manage application data and settings</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center py-4">
              <Shield className="h-12 w-12 text-primary/80" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/politicians')}
            >
              Manage Data
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">System Overview</CardTitle>
            <CardDescription>Key performance metrics and activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center py-4">
              <Activity className="h-12 w-12 text-primary/80" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
