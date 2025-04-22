
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      toast.error(error.message);
      return { success: false, error };
    }
    
    toast.success("Registration successful! Please check your email to verify your account.");
    
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || "Registration failed");
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
      toast.error(error.message);
      return { success: false, error };
    }
    
    // Don't show toast here - AuthContext will handle it
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || "Login failed");
    return { success: false, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) {
      toast.error(error.message);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || "Google login failed");
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return { success: false, error };
    }
    
    // Don't show toast here - AuthContext will handle it
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || "Sign out failed");
    return { success: false, error };
  }
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};
