// Script para testar a conexão com o Supabase
import { supabase, checkSupabaseConnection, tables } from './server';

// Função para testar a conectividade
async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      console.log('✅ Conexão bem-sucedida com o Supabase');
      
      // Testar acesso às tabelas
      console.log('Verificando acesso às tabelas:');
      
      // Visitors
      const { data: visitors, error: visitorsError } = await supabase
        .from(tables.VISITORS)
        .select('count', { count: 'exact', head: true });
      
      if (visitorsError) {
        console.error(`❌ Erro na tabela ${tables.VISITORS}:`, visitorsError.message);
      } else {
        console.log(`✅ Tabela ${tables.VISITORS} acessível`);
      }
      
      // Access Logs
      const { data: logs, error: logsError } = await supabase
        .from(tables.ACCESS_LOGS)
        .select('count', { count: 'exact', head: true });
      
      if (logsError) {
        console.error(`❌ Erro na tabela ${tables.ACCESS_LOGS}:`, logsError.message);
      } else {
        console.log(`✅ Tabela ${tables.ACCESS_LOGS} acessível`);
      }
      
      // Testar acesso ao storage
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Erro no acesso ao storage:', bucketsError.message);
      } else {
        console.log('✅ Storage acessível. Buckets disponíveis:', buckets.map(b => b.name).join(', '));
      }
      
    } else {
      console.error('❌ Falha na conexão com o Supabase');
    }
  } catch (err) {
    console.error('❌ Erro durante teste de conexão:', err);
  }
}

// Executar teste
testSupabaseConnection().catch(console.error);

export default testSupabaseConnection; 