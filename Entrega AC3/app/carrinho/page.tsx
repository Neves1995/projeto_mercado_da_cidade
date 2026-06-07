import { DashboardLayout } from "@/components/dashboard-layout"
import { ShoppingCart } from "@/components/shopping-cart"

export default function CarrinhoPage() {
  return (
    <DashboardLayout title="Carrinho de Compras">
      <ShoppingCart />
    </DashboardLayout>
  )
}
