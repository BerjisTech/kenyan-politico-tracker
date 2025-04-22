
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
            toast({
              title: "Authentication failed",
              description: errorDescription || error,
              variant: "destructive",
            });
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
              toast({
                title: "Authentication failed",
                description: sessionError.message,
                variant: "destructive",
              });
              navigate('/auth');
              return;
            }
            
            toast({
              title: "Authentication successful",
              description: "You have been signed in successfully.",
            });
            navigate('/');
            return;
          }
        } catch (err: any) {
          console.error("Error processing auth callback:", err);
          toast({
            title: "Authentication failed",
            description: err.message || "An error occurred during authentication",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
      }

      // If no hash or token processing failed, fallback to getSession
      const { error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        toast({
          title: "Authentication failed",
          description: sessionError.message,
          variant: "destructive",
        });
        navigate('/auth');
      } else {
        toast({
          title: "Authentication successful",
          description: "You have been signed in successfully.",
        });
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
