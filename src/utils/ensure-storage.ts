import { supabase } from './server';

/**
 * Função para verificar se o bucket 'photos' existe no Supabase Storage
 * Não tenta criar o bucket, apenas verifica se ele existe
 */
export async function ensurePhotosBucket() {
  try {
    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Erro ao listar buckets:", listError);
      return false;
    }
    
    // Verificar se o bucket 'photos' existe
    const photosBucket = buckets?.find(bucket => bucket.name === 'photos');
    
    if (!photosBucket) {
      console.log("Bucket 'photos' não encontrado. É necessário criar manualmente no painel do Supabase.");
      console.log("Instruções: Acesse o painel do Supabase > Storage > Criar novo bucket com nome 'photos' > Ativar 'Public bucket'");
      return false;
    } else {
      console.log("Bucket 'photos' encontrado. Testando permissões de upload...");
    }
    
    // Testar se podemos fazer upload (criando um arquivo de teste)
    const testFile = new File(['test'], 'test-permission.txt', { type: 'text/plain' });
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload('test-permission.txt', testFile, { upsert: true });
      
      if (uploadError) {
        console.error("Erro ao testar upload para o bucket 'photos':", uploadError);
        console.warn("Você precisa configurar as políticas de acesso no Supabase Storage para permitir uploads");
        console.log("Instruções: Acesse o painel do Supabase > Storage > Selecione o bucket 'photos' > Policies > Add policies");
        return false;
      }
      
      console.log("Permissões de upload confirmadas.");
      return true;
    } catch (testError) {
      console.error("Erro ao testar permissões do bucket 'photos':", testError);
      console.warn("Configure as políticas de acesso no Supabase para permitir uploads");
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar bucket 'photos':", error);
    return false;
  }
}