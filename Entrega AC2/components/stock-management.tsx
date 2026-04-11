"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowUpCircle, ArrowDownCircle, RefreshCw, Package, AlertTriangle } from "lucide-react"
import type { Product, StockMovement } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StockManagement() {
  const { data: products, mutate: mutateProducts } = useSWR<Product[]>("/api/products", fetcher)
  const { data: movements, mutate: mutateMovements } = useSWR<(StockMovement & { product_name: string })[]>("/api/stock", fetcher)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState("")
  const [movementType, setMovementType] = useState<"in" | "out" | "adjustment">("in")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const lowStockProducts = products?.filter((p) => p.stock < 10) || []
  const filteredProducts = products?.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct,
          quantity: parseInt(quantity),
          type: movementType,
          reason: reason || null,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setSelectedProduct("")
        setQuantity("")
        setReason("")
        mutateProducts()
        mutateMovements()
      }
    } catch (error) {
      console.error("Erro ao registrar movimentacao:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowUpCircle className="h-4 w-4 text-primary" />
      case "out":
        return <ArrowDownCircle className="h-4 w-4 text-destructive" />
      default:
        return <RefreshCw className="h-4 w-4 text-chart-2" />
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "in":
        return "Entrada"
      case "out":
        return "Saida"
      default:
        return "Ajuste"
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>
    }
    if (stock < 10) {
      return <Badge variant="secondary" className="bg-accent text-accent-foreground">Baixo</Badge>
    }
    return <Badge variant="secondary" className="bg-primary/10 text-primary">Normal</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-accent bg-accent/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <AlertTriangle className="h-5 w-5" />
              Produtos com Estoque Baixo ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((product) => (
                <Badge key={product.id} variant="outline" className="border-accent">
                  {product.name}: {product.stock} un.
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos e Estoque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estoque de Produtos
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Movimentacao
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimentacao de Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Estoque: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Movimentacao</Label>
                  <Select value={movementType} onValueChange={(v) => setMovementType(v as "in" | "out" | "adjustment")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Entrada</SelectItem>
                      <SelectItem value="out">Saida</SelectItem>
                      <SelectItem value="adjustment">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {movementType === "adjustment" ? "Novo Estoque" : "Quantidade"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={movementType === "adjustment" ? "Novo valor do estoque" : "Quantidade"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Motivo (opcional)</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Compra de fornecedor, Venda, Inventario..."
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedProduct || !quantity}
                >
                  {isSubmitting ? "Registrando..." : "Registrar Movimentacao"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                      <TableCell className="text-center font-semibold">{product.stock}</TableCell>
                      <TableCell className="text-center">{getStockBadge(product.stock)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Historico de Movimentacoes */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Movimentacoes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements && movements.length > 0 ? (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          <span>{getMovementLabel(movement.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{movement.product_name}</TableCell>
                      <TableCell className="text-center">
                        <span className={movement.type === "out" ? "text-destructive" : "text-primary"}>
                          {movement.type === "out" ? "-" : "+"}{Math.abs(movement.quantity)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{movement.reason || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(movement.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma movimentacao registrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
