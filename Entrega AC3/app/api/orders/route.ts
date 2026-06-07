import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        subtotal,
        products (id, name)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { items, total } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
  }

  // Criar o pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      total,
      status: "confirmed",
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  // Criar os itens do pedido
  const orderItems = items.map((item: { product_id: string; quantity: number; unit_price: number }) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.quantity * item.unit_price,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // Atualizar o estoque dos produtos
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single()

    if (product) {
      const newStock = product.stock - item.quantity

      await supabase
        .from("products")
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq("id", item.product_id)

      // Registrar movimentacao de estoque
      await supabase.from("stock_movements").insert({
        product_id: item.product_id,
        quantity: -item.quantity,
        type: "out",
        reason: `Venda - Pedido #${order.id.slice(0, 8)}`,
      })
    }
  }

  return NextResponse.json(order, { status: 201 })
}
