import { supabase, isMockDataEnabled, tables } from "../utils/server";

// Tipos para as tabelas
export type Visitor = {
  id?: string;
  name: string;
  cpf: string;
  photo?: string;
  createdAt?: string;
  visitCount?: number;
  lastEntrance?: string;
  visitingApartment?: string;
  isBanned?: boolean;
  banReason?: string;
};

export type AccessLog = {
  id?: string;
  visitorId: string;
  going_to_ap: string;
  authBy: string;
  lastAccess?: string;
  createdAt?: string;
  visitors?: Visitor;
  colaborador?: string | null;
};

// Carrega os dados mockados do arquivo db.json
let mockData: { visitors: Visitor[], access_logs: AccessLog[] } | null = null;

async function loadMockData() {
  if (!mockData) {
    try {
      const response = await fetch('/db.json');
      if (response.ok) {
        mockData = await response.json();
        console.log('Dados mockados carregados com sucesso');
      } else {
        console.error('Erro ao carregar db.json');
        mockData = { visitors: [], access_logs: [] };
      }
    } catch (error) {
      console.error('Erro ao carregar db.json:', error);
      mockData = { visitors: [], access_logs: [] };
    }
  }
  return mockData;
}

// Funções para Visitantes
export async function getVisitors() {
  if (isMockDataEnabled()) {
    console.log('Usando dados mockados para visitors');
    const data = await loadMockData();
    return { data: data?.visitors || [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from(tables.VISITORS)
      .select("*")
      .order("createdAt", { ascending: false });
    
    if (error) {
      console.error("Erro na consulta de visitantes ao Supabase:", error);
      throw error;
    }
    
    return { data, error };
  } catch (err) {
    console.error("Erro ao buscar visitantes, usando dados mockados:", err);
    // Em caso de erro, usar dados mockados como fallback
    const data = await loadMockData();
    return { data: data?.visitors || [], error: null };
  }
}

export async function getVisitorByCpf(cpf: string) {
  if (isMockDataEnabled()) {
    const data = await loadMockData();
    const visitor = data?.visitors.find(v => v.cpf === cpf);
    return { data: visitor || null, error: null };
  }

  const { data, error } = await supabase
    .from(tables.VISITORS)
    .select("*")
    .eq("cpf", cpf)
    .single();
  
  return { data, error };
}

export async function createVisitor(visitor: Visitor) {
  if (isMockDataEnabled()) {
    const data = await loadMockData();
    if (!data) return { data: null, error: { message: "Erro ao carregar dados mockados" } };
    
    const newId = Math.random().toString(36).substring(2, 15);
    const newVisitor = { 
      ...visitor, 
      id: newId, 
      createdAt: new Date().toISOString(),
      visitCount: 1,
      lastEntrance: new Date().toISOString()
    };
    
    data.visitors.push(newVisitor);
    return { data: [newVisitor], error: null };
  }

  try {
    // Gerar um UUID manualmente para o campo id
    // Usando uma implementação simplificada de UUID v4
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    console.log("ID gerado para o novo visitante:", uuid);
    
    // Garantir que o ID não seja nulo
    if (!uuid) {
      throw new Error("Falha ao gerar ID para o visitante");
    }
    
    // Usar o caminho da foto fornecido ou gerar um valor padrão único
    const photoValue = visitor.photo && visitor.photo.trim() ? 
      visitor.photo : `default_photo_${uuid}_${Date.now()}`;
    
    console.log("[DEBUG] Caminho da foto para o visitor:", photoValue);
    
    const { data, error } = await supabase
      .from(tables.VISITORS)
      .insert([{ 
        id: uuid,
        name: visitor.name,
        cpf: visitor.cpf,
        photo: photoValue,
        createdAt: new Date().toISOString()
      }])
      .select();
    
    if (error) {
      console.error("Detalhes do erro ao criar visitante:", error);
      return { data: null, error };
    }
    
    // Verificar novamente se temos dados retornados
    if (!data || data.length === 0) {
      console.error("Nenhum dado retornado após inserção do visitante");
      return { data: null, error: { message: "Falha ao criar visitante: nenhum dado retornado" } };
    }
    
    console.log("Visitante criado com sucesso:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Erro ao criar visitante:", err);
    return { data: null, error: err };
  }
}

export async function updateVisitor(id: string, updates: Partial<Visitor>) {
  if (isMockDataEnabled()) {
    const data = await loadMockData();
    if (!data) return { data: null, error: { message: "Erro ao carregar dados mockados" } };
    
    const index = data.visitors.findIndex(v => v.id === id);
    if (index >= 0) {
      data.visitors[index] = { ...data.visitors[index], ...updates };
      return { data: [data.visitors[index]], error: null };
    }
    return { data: null, error: { message: "Visitante não encontrado" } };
  }

  const { data, error } = await supabase
    .from(tables.VISITORS)
    .update(updates)
    .eq("id", id)
    .select();
  
  return { data, error };
}

// Funções para AccessLogs
export async function getAccessLogs(limit = 20) {
  if (isMockDataEnabled()) {
    console.log('Usando dados mockados para access_logs');
    const data = await loadMockData();
    if (!data) return { data: null, error: { message: "Erro ao carregar dados mockados" } };
    
    // Adicionar informações do visitante aos logs - retornar todos os registros sem limite
    const logsWithVisitors = data.access_logs.map(log => {
      const visitor = data.visitors.find(v => v.id === log.visitorId);
      return {
        ...log,
        visitors: visitor
      };
    });
    
    return { data: logsWithVisitors, error: null };
  }

  try {
    // Alterando a forma como fazemos a consulta para garantir que os relacionamentos funcionem
    console.log("Buscando logs de acesso no Supabase...");
    
    // Primeiro, buscar todos os logs de acesso sem limite (usando um valor alto)
    const { data: accessLogs, error: logsError } = await supabase
      .from(tables.ACCESS_LOGS)
      .select("*")
      .order("lastAccess", { ascending: false })
      .limit(limit === 500 ? 5000 : limit); // Para garantir capturar todos os logs quando solicitado
      
    if (logsError) {
      console.error("Erro na consulta de logs ao Supabase:", logsError);
      throw logsError;
    }
    
    if (!accessLogs || accessLogs.length === 0) {
      console.log("Nenhum log de acesso encontrado");
      return { data: [], error: null };
    }

    console.log(`Encontrados ${accessLogs.length} logs de acesso`);
    
    // Agora, para cada log, buscar o visitante correspondente
    const logsWithVisitors = await Promise.all(
      accessLogs.map(async (log) => {
        try {
          const { data: visitor, error: visitorError } = await supabase
            .from(tables.VISITORS)
            .select("id, name, cpf, photo")
            .eq("id", log.visitorId)
            .single();
            
          if (visitorError) {
            console.warn(`Erro ao buscar visitante para o log ${log.id}:`, visitorError);
            return {
              ...log,
              visitors: {
                name: 'Visitante não encontrado',
                cpf: 'N/A',
                photo: null
              }
            };
          }
          
          return {
            ...log,
            visitors: visitor
          };
        } catch (err) {
          console.error(`Erro ao processar log ${log.id}:`, err);
          return log;
        }
      })
    );
    
    console.log(`Processados ${logsWithVisitors.length} logs com visitantes`);
    return { data: logsWithVisitors, error: null };
  } catch (err) {
    console.error("Erro ao acessar o Supabase, usando dados mockados:", err);
    // Em caso de erro, usar dados mockados como fallback
    const data = await loadMockData();
    const logsWithVisitors = data?.access_logs.map(log => {
      const visitor = data.visitors.find(v => v.id === log.visitorId);
      return {
        ...log,
        visitors: visitor
      };
    }) || [];
    
    return { data: logsWithVisitors, error: null };
  }
}

export async function createAccessLog(log: AccessLog) {
  if (isMockDataEnabled()) {
    const data = await loadMockData();
    if (!data) return { data: null, error: { message: "Erro ao carregar dados mockados" } };
    
    const newId = Math.random().toString(36).substring(2, 15);
    const visitor = data.visitors.find(v => v.id === log.visitorId);
    
    if (!visitor) {
      return { data: null, error: { message: "Visitante não encontrado" } };
    }
    
    // Atualizar o status do visitante
    const visitorIndex = data.visitors.findIndex(v => v.id === log.visitorId);
    if (visitorIndex >= 0) {
      data.visitors[visitorIndex].visitCount = (data.visitors[visitorIndex].visitCount || 0) + 1;
      data.visitors[visitorIndex].lastEntrance = new Date().toISOString();
      data.visitors[visitorIndex].visitingApartment = log.going_to_ap;
    }
    
    const newLog = { 
      ...log, 
      id: newId, 
      lastAccess: log.lastAccess || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      visitors: visitor
    };
    
    data.access_logs.unshift(newLog);
    return { data: [newLog], error: null };
  }

  try {
    // Gerar um UUID manualmente para o campo id do AccessLog
    // Usando uma implementação simplificada de UUID v4
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    console.log("ID gerado para o novo registro de acesso:", uuid);
    
    // Buscar o visitante primeiro para obter o valor do campo photo
    const { data: visitorData, error: visitorError } = await supabase
      .from(tables.VISITORS)
      .select("photo")
      .eq("id", log.visitorId)
      .single();
    
    if (visitorError) {
      console.error("Erro ao buscar foto do visitante:", visitorError);
      return { data: null, error: visitorError };
    }
    
    if (!visitorData || !visitorData.photo) {
      console.error("Visitante não encontrado ou sem foto registrada");
      return { data: null, error: { message: "Visitante não encontrado ou sem foto" } };
    }
    
    // Usar a mesma foto do visitante para o log de acesso
    const photoPath = visitorData.photo;
    
    // Transação para criar log e atualizar visitante
    const { data, error } = await supabase
      .from(tables.ACCESS_LOGS)
      .insert([{ 
        id: uuid,
        visitorId: log.visitorId,
        going_to_ap: log.going_to_ap,
        authBy: log.authBy,
        photoPath: photoPath,
        lastAccess: log.lastAccess || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        colaborador: log.colaborador || null
      }])
      .select();
    
    if (!error && data) {
      // Atualizar informações do visitante
      await supabase
        .from(tables.VISITORS)
        .update({ 
          lastEntrance: new Date().toISOString(),
          visitingApartment: log.going_to_ap
        })
        .eq("id", log.visitorId);
    }
    
    return { data, error };
  } catch (err) {
    console.error("Erro ao criar log de acesso:", err);
    return { data: null, error: err };
  }
}

// Função para upload de foto
export async function uploadVisitorPhoto(file: File): Promise<{ 
  path: string | null; 
  url: string | null; 
  error: any | null 
}> {
  if (isMockDataEnabled()) {
    const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    const mockPath = `mock_photos/${uniqueId}_${file.name.replace(/\s+/g, '_')}`;
    return { 
      path: mockPath,
      url: URL.createObjectURL(file),
      error: null 
    };
  }

  try {
    // Gerar um nome de arquivo único para o storage
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `visitor_photos/${fileName}`;
    
    console.log(`[DEBUG] Iniciando upload para storage: ${filePath}`);
    
    // Upload do arquivo para o Storage do Supabase
    const { data, error } = await supabase.storage
      .from('photos')  // Nome do bucket no Supabase
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('[DEBUG] Erro no upload para storage:', error);
      throw error;
    }
    
    console.log('[DEBUG] Upload para storage concluído com sucesso');
    
    // Gerar URL pública para a foto
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);
    
    console.log('[DEBUG] URL pública gerada:', publicUrlData.publicUrl);
    
    return { 
      path: filePath,
      url: publicUrlData.publicUrl,
      error: null 
    };
  } catch (error) {
    console.error("Erro ao fazer upload de foto para o storage:", error);
    
    // Como fallback, usar o método de base64 anterior
    console.log("[DEBUG] Usando fallback de base64");
    const uniqueId = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve({ 
          path: uniqueId,
          url: base64,
          error: { message: "Falha no upload para storage, usando base64 como fallback" } 
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

export async function checkIfCpfIsBanned(cpf: string) {
  if (isMockDataEnabled()) {
    const data = await loadMockData();
    const visitor = data?.visitors.find(v => v.cpf === cpf && v.isBanned === true);
    return { 
      data: visitor ? { isBanned: true, reason: visitor.banReason } : null, 
      error: null 
    };
  }

  const { data, error } = await supabase
    .from(tables.VISITORS)
    .select("id, isBanned, banReason")
    .eq("cpf", cpf)
    .eq("isBanned", true)
    .single();
  
  return { 
    data: data ? { isBanned: true, reason: data.banReason } : null, 
    error 
  };
} 