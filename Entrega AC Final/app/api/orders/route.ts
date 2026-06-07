import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(name, email), order_items(*, products(name))")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { customer_id, items } = body

  // Calculate total
  const total = items.reduce(
    (acc: number, item: { quantity: number; unit_price: number }) =>
      acc + item.quantity * item.unit_price,
    0
  )

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customer_id || null,
      status: "pending",
      total,
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  // Create order items
  const orderItems = items.map(
    (item: { product_id: string; quantity: number; unit_price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    })
  )

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // Update stock for each product
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single()

    if (product) {
      await supabase
        .from("products")
        .update({
          stock: Math.max(0, product.stock - item.quantity),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id)

      // Record stock movement
      await supabase.from("stock_movements").insert({
        product_id: item.product_id,
        quantity: item.quantity,
        type: "out",
        reason: `Venda - Pedido #${order.id.slice(0, 8)}`,
      })
    }
  }

  return NextResponse.json(order, { status: 201 })
}
