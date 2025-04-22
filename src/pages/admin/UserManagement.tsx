
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  RefreshCw, AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserWithRole {
  user_id: string;
  role: 'superadmin' | 'admin' | 'staff' | 'user';
  updated_at?: string;
  created_at?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { userRole, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const itemsPerPage = 10;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        // First attempt: Use Supabase admin API
        const { data, error: adminError } = await supabase.auth.admin.listUsers({
          page,
          perPage: itemsPerPage,
        });
        
        if (adminError) throw adminError;
        
        // Successfully used admin API
        if (data && 'users' in data) {
          const transformedUsers: UserWithRole[] = data.users.map(user => ({
            user_id: user.id,
            role: 'user', // Default role
            created_at: user.created_at,
            updated_at: user.updated_at
          }));
          
          setUsers(transformedUsers);
          setTotalCount(data.count || 0);
          return; // Exit early as we've handled this successfully
        }
      } catch (adminError) {
        console.log("Admin API not available, falling back to direct query");
        // Fall through to the direct query method
      }
      
      // Fallback: Direct query to user_roles
      const { data: directData, error: directError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at, updated_at')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order('created_at', { ascending: false });
      
      if (directError) {
        console.error("Error fetching users:", directError);
        throw directError;
      }
      
      // Set users from direct query
      setUsers(directData || []);
      
      // Count total records for pagination
      const { count, error: countError } = await supabase
        .from('user_roles')
        .select('user_id', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error fetching user count:", countError);
        throw countError;
      }
      
      setTotalCount(count || 0);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users');
      toast.error('Failed to load users. You may not have the required permissions.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'superadmin' | 'admin' | 'staff' | 'user') => {
    try {
      // Use a simpler update approach to avoid RLS recursion
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchUsers} 
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh user list</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <p className="text-muted-foreground mb-6">
        As a superadmin, you can manage user roles in the system. 
        Changes to user roles take effect immediately.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableCaption>List of all users in the system</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    {user.user_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</TableCell>
                  <TableCell>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => 
                        updateUserRole(
                          user.user_id, 
                          value as 'superadmin' | 'admin' | 'staff' | 'user'
                        )
                      }
                      disabled={user.user_id === currentUser?.id}
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
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => setPage(p)}
                      isActive={page === p}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
