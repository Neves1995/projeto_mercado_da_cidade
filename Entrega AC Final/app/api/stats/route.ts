import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const [
    { count: productsCount },
    { count: customersCount },
    { count: ordersToday },
    { count: lowStockCount },
    { data: recentProducts },
    { data: recentCustomers },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().split("T")[0]),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock", 10),
    supabase
      .from("products")
      .select("id, name, price, stock")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("customers")
      .select("id, name, email")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return NextResponse.json({
    products: productsCount || 0,
    customers: customersCount || 0,
    ordersToday: ordersToday || 0,
    lowStock: lowStockCount || 0,
    recentProducts: recentProducts || [],
    recentCustomers: recentCustomers || [],
  })
}
