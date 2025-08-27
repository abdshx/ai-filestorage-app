"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreVertical,
  Download,
  Share2,
  Eye,
  UserCheck,
  Users,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
} from "lucide-react"

// TODO: Replace with actual shared files data from backend
const mockSharedFiles = [
  {
    id: 1,
    name: "Q4 Marketing Strategy.pdf",
    type: "pdf",
    size: "3.2 MB",
    sharedBy: "Sarah Johnson",
    sharedWith: "Team Marketing",
    sharedDate: "2024-01-15T10:30:00Z",
    permissions: "view",
    thumbnail: null,
  },
  {
    id: 2,
    name: "Brand Guidelines.zip",
    type: "archive",
    size: "25.4 MB",
    sharedBy: "Design Team",
    sharedWith: "All Employees",
    sharedDate: "2024-01-14T14:20:00Z",
    permissions: "download",
    thumbnail: null,
  },
  {
    id: 3,
    name: "Product Demo.mp4",
    type: "video",
    size: "67.8 MB",
    sharedBy: "John Smith",
    sharedWith: "Sales Team",
    sharedDate: "2024-01-13T09:15:00Z",
    permissions: "view",
    thumbnail: "/product-demo-video.png",
  },
  {
    id: 4,
    name: "Company Logo.png",
    type: "image",
    size: "2.1 MB",
    sharedBy: "Creative Team",
    sharedWith: "Marketing Team",
    sharedDate: "2024-01-12T16:45:00Z",
    permissions: "edit",
    thumbnail: "/generic-company-logo.png",
  },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
    case "document":
      return FileText
    case "image":
      return ImageIcon
    case "video":
      return Video
    case "audio":
      return Music
    case "archive":
      return Archive
    default:
      return File
  }
}

const getPermissionIcon = (permission: string) => {
  switch (permission) {
    case "edit":
      return UserCheck
    case "download":
      return Download
    case "view":
    default:
      return Eye
  }
}

const getPermissionColor = (permission: string) => {
  switch (permission) {
    case "edit":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "download":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "view":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function SharedPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = mockSharedFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.sharedBy.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // TODO: Implement actual file operations with backend API
  const handleDownload = (fileId: number) => {
    console.log("Downloading shared file:", fileId)
    // TODO: Implement download logic
  }

  const handleView = (fileId: number) => {
    console.log("Viewing shared file:", fileId)
    // TODO: Implement view logic
  }

  const handleRemoveAccess = (fileId: number) => {
    console.log("Removing access to file:", fileId)
    // TODO: Implement remove access logic
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Shared Files</h1>
        <p className="text-muted-foreground">Files that have been shared with you</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shared files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      {/* File count */}
      <div className="text-sm text-muted-foreground">{filteredFiles.length} shared files</div>

      {/* Shared files list */}
      <div className="space-y-4">
        {filteredFiles.map((file) => {
          const FileIcon = getFileIcon(file.type)
          const PermissionIcon = getPermissionIcon(file.permissions)

          return (
            <Card key={file.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* File icon/thumbnail */}
                  <div className="flex-shrink-0">
                    {file.thumbnail ? (
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={file.thumbnail || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{file.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>{file.size}</span>
                          <span>Shared {formatDate(file.sharedDate)}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(file.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {(file.permissions === "download" || file.permissions === "edit") && (
                            <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleRemoveAccess(file.id)} className="text-destructive">
                            <Share2 className="mr-2 h-4 w-4" />
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Sharing details */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Shared by {file.sharedBy}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">with {file.sharedWith}</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getPermissionColor(file.permissions)}>
                          <PermissionIcon className="mr-1 h-3 w-3" />
                          {file.permissions}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredFiles.length === 0 && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No shared files</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery ? "No files match your search" : "Files shared with you will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
