
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Directly import from sonner

export default function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have a hash in the URL (from OAuth redirect)
      if (window.location.hash) {
        // Extract token from hash and use it to establish session
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          if (error) {
            toast.error(errorDescription || error); // Use toast.error instead
            navigate('/auth');
            return;
          }
          
          // Try to establish session with the token from the URL
          const accessToken = hashParams.get('access_token');
          if (accessToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (sessionError) {
              toast.error(sessionError.message); // Use toast.error
              navigate('/auth');
              return;
            }
            
            // Don't show toast here - AuthContext will handle it
            navigate('/');
            return;
          }
        } catch (err: any) {
          console.error("Error processing auth callback:", err);
          toast.error(err.message || "An error occurred during authentication"); // Use toast.error
          navigate('/auth');
          return;
        }
      }

      // If no hash or token processing failed, fallback to getSession
      const { error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        toast.error(sessionError.message); // Use toast.error
        navigate('/auth');
      } else {
        // Don't show toast here - AuthContext will handle it
        navigate('/');
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="mt-4 text-xl font-semibold">Finalizing authentication...</h2>
      <p className="mt-2 text-muted-foreground">Please wait while we complete the process.</p>
    </div>
  );
}
