-- Criação da tabela de visitantes
CREATE TABLE IF NOT EXISTS visitors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  photo_path TEXT,
  registry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  in BOOLEAN DEFAULT FALSE,
  visit_count INTEGER DEFAULT 0,
  last_entry_time TIMESTAMP WITH TIME ZONE,
  visiting_apartment TEXT
);

-- Criação da tabela de logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
  id SERIAL PRIMARY KEY,
  visitor_id INTEGER REFERENCES visitors(id),
  apartment TEXT NOT NULL,
  auth_by TEXT NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  photo_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  going_to_ap TEXT,
  colaborador TEXT
);

-- Função para incrementar contador de visitas
CREATE OR REPLACE FUNCTION increment_visit_count(
  visitor_id INTEGER,
  apartment TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE visitors
  SET 
    visit_count = COALESCE(visit_count, 0) + 1,
    last_entry_time = NOW(),
    visiting_apartment = apartment,
    in = TRUE
  WHERE id = visitor_id;
END;
$$ LANGUAGE plpgsql; 