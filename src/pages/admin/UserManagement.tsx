
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
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
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users through the admin API (requires RLS bypass)
      const { data: authUsers, error: authError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role
        `);
      
      if (authError) throw authError;
      
      // Get extended profile info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at');
        
      if (profileError) throw profileError;
      
      // Get emails from auth.users
      // Since we can't directly query auth.users, we'll use a user info approach
      const userEmails = new Map();
      
      // For each user, get their email if possible
      const emailPromises = authUsers.map(async (user) => {
        // For the current user, we can get the email from the auth context
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.id === user.user_id) {
          userEmails.set(user.user_id, userData.user.email);
        }
      });
      
      await Promise.all(emailPromises);
      
      // Combine all data
      const combinedUsers = authUsers.map((user) => {
        const profile = profileData?.find(p => p.id === user.user_id);
        
        return {
          id: user.user_id,
          email: userEmails.get(user.user_id) || 'Email hidden',
          role: user.role,
          created_at: profile?.created_at || 'Unknown',
          first_name: profile?.first_name || undefined,
          last_name: profile?.last_name || undefined,
        };
      });
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'superadmin' | 'admin' | 'staff' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
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
                    disabled={user.role === 'superadmin' && userRole === 'superadmin'}
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
