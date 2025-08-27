"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FileText, Home, Share2, Settings, LogOut, FolderOpen, Upload, Trash2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUploadModal } from "@/hooks/use-upload-modal"

const navigationItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "My Files",
    href: "/dashboard/files",
    icon: FolderOpen,
  },
  {
    title: "Shared",
    href: "/dashboard/shared",
    icon: Share2,
  },
  {
    title: "Recent",
    href: "/dashboard/recent",
    icon: FileText,
  },
  {
    title: "Trash",
    href: "/dashboard/trash",
    icon: Trash2,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const uploadModal = useUploadModal()

  // TODO: Replace with actual logout function connected to Supabase Auth
  const handleLogout = () => {
    console.log("Logging out...")
    // TODO: Implement actual logout logic here
    // await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo and brand */}
      <div className="flex items-center gap-2 p-6 border-b border-sidebar-border">
        <div className="p-2 bg-sidebar-primary rounded-lg">
          <FileText className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-serif font-bold text-sidebar-foreground">FileVault</h1>
            <p className="text-xs text-muted-foreground">File Management</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          onClick={uploadModal.open}
          className="w-full bg-sidebar-primary hover:bg-sidebar-accent text-sidebar-primary-foreground"
          size={isCollapsed ? "icon" : "default"}
        >
          <Upload className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Upload Files</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  isCollapsed && "px-2",
                )}
                size={isCollapsed ? "icon" : "default"}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Settings and logout */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            size={isCollapsed ? "icon" : "default"}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          size={isCollapsed ? "icon" : "default"}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
