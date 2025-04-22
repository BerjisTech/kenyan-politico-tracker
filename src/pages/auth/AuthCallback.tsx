
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      // The hash contains the token
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
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
