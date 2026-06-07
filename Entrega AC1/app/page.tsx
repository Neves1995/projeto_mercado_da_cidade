import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardStats } from "@/components/dashboard-stats"

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardStats />
    </DashboardLayout>
  )
}
