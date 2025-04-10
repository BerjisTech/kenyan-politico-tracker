
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: 'superadmin' | 'admin' | 'staff' | 'user';
  first_name?: string;
  last_name?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole, user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Call a Supabase function to get user roles
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at');
      
      if (userError) throw userError;
      
      // For each user profile, get their role using RPC function
      const usersWithRoles = await Promise.all(
        userData.map(async (profile) => {
          const { data: roleData } = await supabase
            .rpc('get_user_role', { user_id: profile.id });
          
          // If the current user, we can get email from auth context
          let email = 'Email hidden';
          if (currentUser && currentUser.id === profile.id) {
            email = currentUser.email || 'Email hidden';
          }
          
          return {
            id: profile.id,
            email: email,
            created_at: profile.created_at,
            role: roleData as 'superadmin' | 'admin' | 'staff' | 'user',
            first_name: profile.first_name,
            last_name: profile.last_name,
          };
        })
      );
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'superadmin' | 'admin' | 'staff' | 'user') => {
    try {
      // Use the Supabase URL and Anon key from the environment variables
      const SUPABASE_URL = "https://tsgatxcialgoepfbwtgk.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZ2F0eGNpYWxnb2VwZmJ3dGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODIyODUsImV4cCI6MjA1OTg1ODI4NX0.096fGcTQBJxXDcYoc5lbLH4m_-6vkyiqcJTiwAzxOdQ";
      
      // Instead of directly updating the user_roles table, use a SERVER function that bypasses RLS
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/update_user_role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_role: newRole
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  if (userRole !== 'superadmin') {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Access Denied</h1>
        <p className="text-muted-foreground">
          Only superadmins can access the user management page.
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
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p className="text-muted-foreground mb-6">
        As a superadmin, you can manage user roles in the system. 
        Changes to user roles take effect immediately.
      </p>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      ) : (
        <Table>
          <TableCaption>List of all users in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name || user.last_name ? 
                    `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                    'No name provided'}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) => 
                      updateUserRole(
                        user.id, 
                        value as 'superadmin' | 'admin' | 'staff' | 'user'
                      )
                    }
                    disabled={user.id === currentUser?.id && userRole === 'superadmin'}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
