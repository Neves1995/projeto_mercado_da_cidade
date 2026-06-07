import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomersList } from "@/components/customers-list"

export default function ClientesPage() {
  return (
    <DashboardLayout>
      <CustomersList />
    </DashboardLayout>
  )
}
