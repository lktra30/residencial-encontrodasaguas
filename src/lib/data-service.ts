"use client";

import { supabase, isMockDataEnabled } from "../utils/server";

// Definições para dados mockados
interface MockDb {
  residents: Resident[];
  visitors: Visitor[];
  accessLogs: {
    id: number;
    visitorId: number;
    apartment: string;
    entryTime: string;
    authorizedByName: string;
    photo?: string;
  }[];
}

// Dados mockados para uso em desenvolvimento
const db: MockDb = {
  residents: [
    { id: 1, name: "João Silva", rg: "12.345.678-9", apartment: "101", isOwner: true, phone: "(11) 91234-5678", lastEntrance: "2023-07-10T14:30:00Z" },
    { id: 2, name: "Maria Souza", rg: "98.765.432-1", apartment: "102", isOwner: false, phone: "(11) 98765-4321", lastEntrance: "2023-07-09T10:15:00Z" },
    { id: 3, name: "Pedro Oliveira", rg: "45.678.912-3", apartment: "201", isOwner: true, phone: "(11) 94567-8912", lastEntrance: "2023-07-08T16:45:00Z" },
  ],
  visitors: [
    { id: 1, name: "Ana Rodrigues", rg: "34.567.890-1", visitingApartment: "101", visitCount: 3, lastEntrance: "2023-07-09T15:30:00Z", photo: "mock_photos/ana.jpg" },
    { id: 2, name: "Carlos Ferreira", rg: "56.789.012-3", visitingApartment: "102", visitCount: 1, lastEntrance: "2023-07-08T11:20:00Z", photo: "mock_photos/carlos.jpg" },
    { id: 3, name: "Lucia Mendes", rg: "67.890.123-4", visitingApartment: "201", visitCount: 2, lastEntrance: "2023-07-07T14:15:00Z", photo: "mock_photos/lucia.jpg" },
  ],
  accessLogs: [
    { id: 1, visitorId: 1, apartment: "101", entryTime: "2023-07-09T15:30:00Z", authorizedByName: "João Silva", photo: "mock_photos/ana_log.jpg" },
    { id: 2, visitorId: 2, apartment: "102", entryTime: "2023-07-08T11:20:00Z", authorizedByName: "Maria Souza", photo: "mock_photos/carlos_log.jpg" },
    { id: 3, visitorId: 3, apartment: "201", entryTime: "2023-07-07T14:15:00Z", authorizedByName: "Pedro Oliveira", photo: "mock_photos/lucia_log.jpg" },
    { id: 4, visitorId: 1, apartment: "101", entryTime: "2023-07-06T10:45:00Z", authorizedByName: "João Silva", photo: "mock_photos/ana_log2.jpg" },
  ]
};

// Tipos
export interface Resident {
  id: number;
  name: string;
  rg: string;
  apartment: string;
  isOwner: boolean;
  phone: string;
  lastEntrance?: string;
}

export interface Visitor {
  id: number;
  name: string;
  rg: string;
  visitingApartment: string;
  visitCount: number;
  lastEntrance: string;
  photo?: string;
}

export interface AccessLog {
  id?: number;
  visitor_id: number;
  apartment: string;
  auth_by: string;
  entry_time: string;
  photo_path?: string;
  created_at?: string;
}

// Interface para log de acesso mockado
interface MockAccessLog {
  id: number;
  visitorId: number;
  apartment: string;
  entryTime: string;
  authorizedByName: string;
  photo?: string;
}

// Buscar residentes
export async function getResidents(): Promise<{ data: Resident[] | null; error: any }> {
  if (isMockDataEnabled()) {
    return { data: db.residents, error: null };
  }

  try {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .order("apartment", { ascending: true });
    
    return { data, error };
  } catch (error) {
    console.error("Erro ao buscar residentes:", error);
    return { data: db.residents, error: null };
  }
}

// Buscar visitantes
export async function getVisitors(): Promise<{ data: Visitor[] | null; error: any }> {
  if (isMockDataEnabled()) {
    return { data: db.visitors, error: null };
  }

  try {
    const { data, error } = await supabase
      .from("visitors")
      .select(`
        id,
        name,
        rg,
        visitingApartment:apartment,
        visitCount,
        lastEntrance:last_entry_time,
        photo
      `)
      .order("last_entry_time", { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error("Erro ao buscar visitantes:", error);
    return { data: db.visitors, error: null };
  }
}

// Buscar logs de acesso
export async function getAccessLogs(limit = 20): Promise<{ data: any[] | null; error: any }> {
  if (isMockDataEnabled()) {
    // Criar um formato que imita a resposta do Supabase com relacionamentos
    const transformedData = db.accessLogs.slice(0, limit).map((log: MockAccessLog) => {
      const visitor = db.visitors.find((v: Visitor) => v.id === log.visitorId);
      return {
        id: log.id,
        visitor_id: log.visitorId,
        apartment: log.apartment,
        auth_by: log.authorizedByName,
        entry_time: log.entryTime,
        created_at: log.entryTime,
        visitors: visitor ? {
          id: visitor.id,
          name: visitor.name,
          cpf: visitor.rg,
          photo_path: visitor.photo
        } : null
      };
    });
    
    return { data: transformedData, error: null };
  }

  try {
    const { data, error } = await supabase
      .from("access_logs")
      .select(`
        *,
        visitors (id, name, cpf, photo_path)
      `)
      .order("entry_time", { ascending: false })
      .limit(limit);
    
    return { data, error };
  } catch (error) {
    console.error("Erro ao buscar logs de acesso:", error);
    
    // Retornar dados mockados em caso de erro
    const transformedData = db.accessLogs.slice(0, limit).map((log: MockAccessLog) => {
      const visitor = db.visitors.find((v: Visitor) => v.id === log.visitorId);
      return {
        id: log.id,
        visitor_id: log.visitorId,
        apartment: log.apartment,
        auth_by: log.authorizedByName,
        entry_time: log.entryTime,
        created_at: log.entryTime,
        visitors: visitor ? {
          id: visitor.id,
          name: visitor.name,
          cpf: visitor.rg,
          photo_path: visitor.photo
        } : null
      };
    });
    
    return { data: transformedData, error: null };
  }
}

// Criar um novo visitante
export async function createVisitor(visitor: Omit<Visitor, "id" | "visitCount" | "lastEntrance">): Promise<{ data: any; error: any }> {
  if (isMockDataEnabled()) {
    const newId = Math.max(...db.visitors.map((v: Visitor) => v.id)) + 1;
    const now = new Date().toISOString();
    const newVisitor = { 
      ...visitor, 
      id: newId, 
      visitCount: 1, 
      lastEntrance: now 
    };
    db.visitors.push(newVisitor);
    return { data: newVisitor, error: null };
  }

  try {
    const { data, error } = await supabase
      .from("visitors")
      .insert([{ 
        name: visitor.name, 
        rg: visitor.rg, 
        apartment: visitor.visitingApartment, 
        visit_count: 1,
        last_entry_time: new Date().toISOString(),
        photo: visitor.photo
      }])
      .select();
    
    return { data, error };
  } catch (error) {
    console.error("Erro ao criar visitante:", error);
    return { data: null, error };
  }
}

// Registrar entrada de visitante
export async function createAccessLog(accessLog: Omit<AccessLog, "id" | "created_at">): Promise<{ data: any; error: any }> {
  if (isMockDataEnabled()) {
    const newId = Math.max(...db.accessLogs.map((log: MockAccessLog) => log.id)) + 1;
    const now = new Date().toISOString();
    const newLog = {
      id: newId,
      visitorId: accessLog.visitor_id,
      apartment: accessLog.apartment,
      entryTime: now,
      authorizedByName: accessLog.auth_by,
      photo: accessLog.photo_path
    };
    
    // Atualizar contador de visitas e última entrada do visitante
    const visitorIndex = db.visitors.findIndex((v: Visitor) => v.id === accessLog.visitor_id);
    if (visitorIndex !== -1) {
      db.visitors[visitorIndex].visitCount += 1;
      db.visitors[visitorIndex].lastEntrance = now;
      db.visitors[visitorIndex].visitingApartment = accessLog.apartment;
    }
    
    db.accessLogs.unshift(newLog);
    return { data: newLog, error: null };
  }

  try {
    // Primeiro registrar o log de acesso
    const { data, error } = await supabase
      .from("access_logs")
      .insert([{ 
        visitor_id: accessLog.visitor_id,
        apartment: accessLog.apartment,
        auth_by: accessLog.auth_by,
        entry_time: new Date().toISOString(),
        photo_path: accessLog.photo_path
      }])
      .select();
    
    if (!error) {
      // Incrementar o contador de visitas do visitante
      await supabase.rpc('increment_visit_count', { 
        visitor_id: accessLog.visitor_id,
        apartment: accessLog.apartment
      });
    }
    
    return { data, error };
  } catch (error) {
    console.error("Erro ao registrar entrada:", error);
    return { data: null, error };
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
    // Remover a pasta visitor_photos/ e salvar diretamente na raiz do bucket
    const filePath = fileName;
    
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