import { createClient } from '@supabase/supabase-js';

// Acessa as variáveis de ambiente.
// Elas estarão disponíveis no ambiente de execução do Vercel.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
