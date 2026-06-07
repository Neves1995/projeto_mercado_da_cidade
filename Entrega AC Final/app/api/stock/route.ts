import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { product_id, quantity, type, reason } = body

  // Create stock movement record
  const { error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      product_id,
      quantity: parseInt(quantity),
      type,
      reason,
    })

  if (movementError) {
    return NextResponse.json({ error: movementError.message }, { status: 500 })
  }

  // Update product stock
  const { data: product, error: getError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", product_id)
    .single()

  if (getError) {
    return NextResponse.json({ error: getError.message }, { status: 500 })
  }

  let newStock = product.stock
  if (type === "in") {
    newStock += parseInt(quantity)
  } else if (type === "out") {
    newStock -= parseInt(quantity)
  } else if (type === "adjustment") {
    newStock = parseInt(quantity)
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: Math.max(0, newStock), updated_at: new Date().toISOString() })
    .eq("id", product_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Estoque atualizado com sucesso" }, { status: 201 })
}
