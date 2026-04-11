export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  image_url: string | null
  sku: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string | null
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  created_at: string
  updated_at: string
  customer?: Customer
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  product?: Product
}

export interface StockMovement {
  id: string
  product_id: string
  quantity: number
  type: 'in' | 'out' | 'adjustment'
  reason: string | null
  created_at: string
  product?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}
