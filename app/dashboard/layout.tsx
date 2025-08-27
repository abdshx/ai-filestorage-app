import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UploadModalProvider } from "@/components/upload/upload-modal-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop layout */}
      <div className="hidden md:flex">
        {/* Sidebar */}
        <div className="w-64 fixed inset-y-0 left-0 z-50">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <DashboardHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <DashboardHeader />
        <main className="p-4">{children}</main>
      </div>

      <UploadModalProvider />
    </div>
  )
}
