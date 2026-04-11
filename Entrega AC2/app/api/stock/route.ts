import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: movements, error } = await supabase
    .from("stock_movements")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedMovements = movements?.map((m) => ({
    ...m,
    product_name: (m.products as { name: string } | null)?.name || "Produto removido",
  })) || []

  return NextResponse.json(formattedMovements)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { product_id, quantity, type, reason } = body

  if (!product_id || quantity === undefined || !type) {
    return NextResponse.json(
      { error: "Produto, quantidade e tipo são obrigatórios" },
      { status: 400 }
    )
  }

  // Buscar estoque atual
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", product_id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  }

  // Calcular novo estoque
  let newStock = product.stock
  if (type === "in") {
    newStock += quantity
  } else if (type === "out") {
    newStock -= quantity
    if (newStock < 0) {
      return NextResponse.json(
        { error: "Estoque insuficiente para esta saída" },
        { status: 400 }
      )
    }
  } else if (type === "adjustment") {
    newStock = quantity
  }

  // Registrar movimentação
  const { error: movementError } = await supabase.from("stock_movements").insert({
    product_id,
    quantity: type === "adjustment" ? quantity - product.stock : quantity,
    type,
    reason,
  })

  if (movementError) {
    return NextResponse.json({ error: movementError.message }, { status: 500 })
  }

  // Atualizar estoque do produto
  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("id", product_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, newStock })
}
