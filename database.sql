-- =====================================================
-- SQL para criar tabelas no Supabase
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Criar tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('fácil', 'médio', 'difícil')),
    subject TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para filtros
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_subject ON exercises(subject);
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

-- Política: Qualquer usuário autenticado pode ver exercícios
CREATE POLICY "Authenticated users can view exercises" ON exercises
    FOR SELECT USING (true);

-- Política: Usuários podem criar exercícios
CREATE POLICY "Users can create exercises" ON exercises
    FOR INSERT WITH CHECK (true);

-- Política: Usuários podem editar apenas seus próprios exercícios
CREATE POLICY "Users can update own exercises" ON exercises
    FOR UPDATE USING (created_by = auth.uid());

-- Política: Usuários podem deletar apenas seus próprios exercícios
CREATE POLICY "Users can delete own exercises" ON exercises
    FOR DELETE USING (created_by = auth.uid());

-- =====================================================
-- Dados de exemplo (opcional)
-- =====================================================

-- Descomente as linhas abaixo após criar um usuário para inserir exemplos:

-- INSERT INTO exercises (title, statement, answer, difficulty, subject, created_by)
-- VALUES 
--     ('Equação de Primeiro Grau', 'Resolva: 2x + 5 = 15', 'x = 5', 'fácil', 'álgebra', 'SEU_USER_ID_AQUI'),
--     ('Área do Triângulo', 'Calcule a área de um triângulo com base 10cm e altura 8cm.', '40 cm²', 'fácil', 'geometria', 'SEU_USER_ID_AQUI'),
--     ('Equação de Segundo Grau', 'Resolva: x² - 5x + 6 = 0', 'x = 2 ou x = 3', 'médio', 'álgebra', 'SEU_USER_ID_AQUI'),
--     ('Teorema de Pitágoras', 'Em um triângulo retângulo, os catetos medem 3cm e 4cm. Qual é a hipotenusa?', '5 cm', 'médio', 'geometria', 'SEU_USER_ID_AQUI'),
--     ('Derivada', 'Calcule a derivada de f(x) = 3x² + 2x - 1', 'f\'(x) = 6x + 2', 'difícil', 'cálculo', 'SEU_USER_ID_AQUI');
