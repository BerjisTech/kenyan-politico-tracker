
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type SignUpData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export const signUp = async (data: SignUpData) => {
  try {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName || '',
          last_name: data.lastName || '',
        },
      },
    });
    
    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    toast({
      title: "Registration successful",
      description: "Please check your email to verify your account.",
    });
    
    return { success: true };
  } catch (error: any) {
    toast({
      title: "Registration failed",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }
};

export const signIn = async (data: SignInData) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
    
    return { success: true };
  } catch (error: any) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      }
    });
    
    if (error) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error: any) {
    toast({
      title: "Google login failed",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    
    return { success: true };
  } catch (error: any) {
    toast({
      title: "Sign out failed",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};
