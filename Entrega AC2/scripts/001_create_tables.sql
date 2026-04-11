-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  sku TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Movimentação de Estoque
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO categories (name, description) 
SELECT 'Bebidas', 'Refrigerantes, sucos, águas e outras bebidas'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bebidas');

INSERT INTO categories (name, description) 
SELECT 'Laticínios', 'Leite, queijos, iogurtes e derivados'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Laticínios');

INSERT INTO categories (name, description) 
SELECT 'Padaria', 'Pães, bolos e produtos de panificação'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Padaria');

INSERT INTO categories (name, description) 
SELECT 'Hortifruti', 'Frutas, legumes e verduras'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Hortifruti');

INSERT INTO categories (name, description) 
SELECT 'Carnes', 'Carnes bovinas, suínas, aves e peixes'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Carnes');

INSERT INTO categories (name, description) 
SELECT 'Limpeza', 'Produtos de limpeza e higiene'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Limpeza');

INSERT INTO categories (name, description) 
SELECT 'Mercearia', 'Arroz, feijão, massas e produtos gerais'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Mercearia');
