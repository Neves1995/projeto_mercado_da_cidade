import { DashboardLayout } from "@/components/dashboard-layout"
import { StockManagement } from "@/components/stock-management"

export default function EstoquePage() {
  return (
    <DashboardLayout title="Gerenciamento de Estoque">
      <StockManagement />
    </DashboardLayout>
  )
}
