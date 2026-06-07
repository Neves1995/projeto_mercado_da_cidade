"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Boxes,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product, StockMovement } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StockManagement() {
  const { data: products, mutate: mutateProducts } = useSWR<Product[]>(
    "/api/products",
    fetcher
  )
  const { data: movements, mutate: mutateMovements } = useSWR<
    (StockMovement & { products: { name: string } | null })[]
  >("/api/stock", fetcher)

  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [movementType, setMovementType] = useState<"in" | "out" | "adjustment">(
    "in"
  )
  const [formData, setFormData] = useState({
    quantity: "",
    reason: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenDialog = (
    product: Product,
    type: "in" | "out" | "adjustment"
  ) => {
    setSelectedProduct(product)
    setMovementType(type)
    setFormData({ quantity: type === "adjustment" ? String(product.stock) : "", reason: "" })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setIsLoading(true)

    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: selectedProduct.id,
        quantity: formData.quantity,
        type: movementType,
        reason: formData.reason,
      }),
    })

    setIsLoading(false)
    setIsDialogOpen(false)
    mutateProducts()
    mutateMovements()
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowDownCircle className="h-4 w-4 text-primary" />
      case "out":
        return <ArrowUpCircle className="h-4 w-4 text-destructive" />
      default:
        return <RefreshCw className="h-4 w-4 text-accent-foreground" />
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "in":
        return "Entrada"
      case "out":
        return "Saída"
      default:
        return "Ajuste"
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Boxes className="h-5 w-5" />
              Estoque Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!products ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">
                        Produto
                      </TableHead>
                      <TableHead className="text-center text-muted-foreground">
                        Estoque
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              product.stock < 10 ? "destructive" : "default"
                            }
                            className={
                              product.stock < 10
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-primary text-primary-foreground"
                            }
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(product, "in")}
                              className="h-8"
                            >
                              <ArrowDownCircle className="mr-1 h-3 w-3" />
                              Entrada
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(product, "out")}
                              className="h-8"
                            >
                              <ArrowUpCircle className="mr-1 h-3 w-3" />
                              Saída
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenDialog(product, "adjustment")
                              }
                              className="h-8"
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Ajuste
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Boxes className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum produto encontrado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <RefreshCw className="h-5 w-5" />
              Movimentações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!movements ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : movements.length > 0 ? (
              <div className="max-h-[500px] space-y-3 overflow-y-auto">
                {movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <p className="font-medium text-foreground">
                          {movement.products?.name || "Produto removido"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {movement.reason || getMovementLabel(movement.type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          movement.type === "in"
                            ? "text-primary"
                            : movement.type === "out"
                              ? "text-destructive"
                              : "text-accent-foreground"
                        }`}
                      >
                        {movement.type === "in" ? "+" : movement.type === "out" ? "-" : ""}
                        {movement.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movement.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RefreshCw className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma movimentação registrada
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {movementType === "in"
                ? "Entrada de Estoque"
                : movementType === "out"
                  ? "Saída de Estoque"
                  : "Ajuste de Estoque"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Produto</p>
              <p className="font-medium text-foreground">
                {selectedProduct?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Estoque atual: {selectedProduct?.stock}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                {movementType === "adjustment"
                  ? "Novo Estoque"
                  : "Quantidade"}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Descreva o motivo da movimentação..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
