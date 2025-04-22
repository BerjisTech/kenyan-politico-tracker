
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: 'superadmin' | 'admin' | 'staff' | 'user' | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  userRole: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'superadmin' | 'admin' | 'staff' | 'user' | null>(null);

  // Fetch user role from database using a function to avoid RLS policies
  const fetchUserRole = async (userId: string) => {
    try {
      // Use RPC call to get_user_role_safely function instead of direct table query
      // This avoids the infinite recursion issue with RLS policies
      const { data, error } = await supabase.rpc('get_user_role_safely', {
        user_id: userId
      });

      if (error) {
        console.error("Error fetching user role:", error);
        // If no role is found, set default role to 'user'
        setUserRole('user');
        return;
      }

      if (data) {
        setUserRole(data as 'superadmin' | 'admin' | 'staff' | 'user');
      } else {
        setUserRole('user'); // Default role
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole('user'); // Default role in case of errors
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        // Show toast notifications for auth events
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully.');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully.');
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
