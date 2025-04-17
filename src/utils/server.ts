import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useMockData = process.env.USE_MOCK_DATA === "true";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "As variáveis de ambiente do Supabase não estão configuradas. Verifique o arquivo .env.local"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Helpers para dados mockados
export const isMockDataEnabled = () => {
  // Usar apenas o flag USE_MOCK_DATA para controlar mock, sem fallback automático
  return useMockData;
};

// Funções auxiliares para o Supabase
export const tables = {
  VISITORS: 'Visitor', // Nome da tabela no Prisma
  ACCESS_LOGS: 'AccessLog' // Nome da tabela no Prisma
};

export const supabaseAdmin = supabase;

// Função para verificar a conexão com o Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from(tables.VISITORS).select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error);
      return false;
    }
    
    console.log('Conexão com Supabase bem-sucedida');
    return true;
  } catch (err) {
    console.error('Erro ao verificar conexão com Supabase:', err);
    return false;
  }
};