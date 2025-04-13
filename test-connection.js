const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://erbehnwhtpfjyurvylvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYmVobndodHBmanl1cnZ5bHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMzUyNjIsImV4cCI6MjA1OTkxMTI2Mn0.beCl4TbuIeO4EIgublOWabiVvt_9XP2n2Nm2dSCeBSk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar a conexão
async function testConnection() {
  console.log('Testando conexão com o Supabase...');
  
  try {
    // Testar acesso à tabela de visitantes
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitors')
      .select('count', { count: 'exact', head: true });
    
    if (visitorsError) {
      console.error('❌ Erro ao acessar tabela de visitantes:', visitorsError.message);
    } else {
      console.log('✅ Tabela de visitantes acessível');
    }
    
    // Testar acesso à tabela de logs
    const { data: logs, error: logsError } = await supabase
      .from('access_logs')
      .select('count', { count: 'exact', head: true });
    
    if (logsError) {
      console.error('❌ Erro ao acessar tabela de logs:', logsError.message);
    } else {
      console.log('✅ Tabela de logs acessível');
    }
    
    // Testar acesso ao storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao acessar storage:', bucketsError.message);
    } else {
      console.log('✅ Storage acessível. Buckets disponíveis:', buckets.map(b => b.name).join(', '));
    }
    
  } catch (err) {
    console.error('❌ Erro durante teste de conexão:', err);
  }
}

// Executar teste
testConnection().catch(console.error); 