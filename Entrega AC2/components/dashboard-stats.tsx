"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Layers, AlertTriangle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DashboardStats() {
  const { data: stats, isLoading } = useSWR("/api/stats", fetcher)

  const statCards = [
    {
      title: "Total de Produtos",
      value: stats?.products || 0,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Categorias",
      value: stats?.categories || 0,
      icon: Layers,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Estoque Baixo",
      value: stats?.lowStock || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Produtos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : stats?.recentProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentProducts.map((product: { id: string; name: string; price: number; stock: number; category_name?: string }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category_name || "Sem categoria"} - Estoque: {product.stock} un.
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    R$ {Number(product.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Nenhum produto cadastrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
