import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSupabaseTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async () => {
    setIsTestingConnection(true);
    console.log('🔍 Testing Supabase connection...');

    try {
      // Test 1: Basic connection
      console.log('📡 Testing basic connection...');
      const { data: testData, error: testError } = await supabase
        .from('roadmaps')
        .select('count', { count: 'exact', head: true });

      if (testError) {
        console.error('❌ Connection test failed:', testError);
        toast.error(`Erro de conexão: ${testError.message}`);
        return false;
      }

      console.log('✅ Basic connection successful');

      // Test 2: Authentication
      console.log('🔐 Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('❌ Auth test failed:', authError);
        toast.error(`Erro de autenticação: ${authError.message}`);
        return false;
      }

      if (!user) {
        console.log('⚠️ User not authenticated');
        toast.warning('Usuário não autenticado. Faça login para salvar dados.');
        return false;
      }

      console.log('✅ Authentication successful, user:', user.id);

      // Test 3: Database access with RLS
      console.log('🔒 Testing database access with RLS...');
      const { data: userRoadmaps, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('id')
        .limit(1);

      if (roadmapError) {
        console.error('❌ Database access test failed:', roadmapError);
        toast.error(`Erro de acesso ao banco: ${roadmapError.message}`);
        return false;
      }

      console.log('✅ Database access successful');
      toast.success('Conexão com Supabase funcionando corretamente!');
      return true;

    } catch (error: any) {
      console.error('❌ Unexpected error during connection test:', error);
      toast.error(`Erro inesperado: ${error.message}`);
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    testConnection,
    isTestingConnection
  };
}