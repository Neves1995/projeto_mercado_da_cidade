import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: lowStockCount },
    { data: recentProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).lt("stock", 10),
    supabase
      .from("products")
      .select("id, name, price, stock, categories(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const formattedProducts = recentProducts?.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    category_name: (p.categories as { name: string } | null)?.name || null,
  })) || []

  return NextResponse.json({
    products: productsCount || 0,
    categories: categoriesCount || 0,
    lowStock: lowStockCount || 0,
    recentProducts: formattedProducts,
  })
}
