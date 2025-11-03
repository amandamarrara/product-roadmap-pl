import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error("Este email já está registrado. Tente fazer login.");
        } else {
          toast.error(`Erro no cadastro: ${error.message}`);
        }
        return { error };
      }

      toast.success("Cadastro realizado! Verifique seu email para confirmar a conta.");

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Email ou senha incorretos.");
        } else {
          toast.error(`Erro no login: ${error.message}`);
        }
        return { error };
      }

      // Ensure state is updated immediately after login
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      toast.success("Login realizado! Bem-vindo de volta!");

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(`Erro ao sair: ${error.message}`);
        return { error };
      }

      toast.success("Você foi desconectado com sucesso.");

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
}