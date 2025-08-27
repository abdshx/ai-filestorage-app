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
  Trash2,
  Clock,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
} from "lucide-react"

// TODO: Replace with actual recent files data from backend
const mockRecentFiles = [
  {
    id: 1,
    name: "Project Proposal.pdf",
    type: "pdf",
    size: "2.4 MB",
    lastAccessed: "2024-01-15T10:30:00Z",
    action: "opened",
    shared: false,
    thumbnail: null,
  },
  {
    id: 2,
    name: "Design Assets.zip",
    type: "archive",
    size: "15.8 MB",
    lastAccessed: "2024-01-15T09:15:00Z",
    action: "downloaded",
    shared: true,
    thumbnail: null,
  },
  {
    id: 3,
    name: "Meeting Recording.mp4",
    type: "video",
    size: "45.2 MB",
    lastAccessed: "2024-01-14T16:45:00Z",
    action: "uploaded",
    shared: false,
    thumbnail: "/meeting-recording-concept.png",
  },
  {
    id: 4,
    name: "Profile Photo.jpg",
    type: "image",
    size: "3.1 MB",
    lastAccessed: "2024-01-14T14:20:00Z",
    action: "shared",
    shared: true,
    thumbnail: "/professional-headshot.png",
  },
  {
    id: 5,
    name: "Budget Report.xlsx",
    type: "document",
    size: "1.8 MB",
    lastAccessed: "2024-01-13T11:30:00Z",
    action: "edited",
    shared: false,
    thumbnail: null,
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

const getActionColor = (action: string) => {
  switch (action) {
    case "uploaded":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "shared":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "edited":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "downloaded":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "opened":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return "Yesterday"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function RecentPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = mockRecentFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // TODO: Implement actual file operations with backend API
  const handleDownload = (fileId: number) => {
    console.log("Downloading file:", fileId)
    // TODO: Implement download logic
  }

  const handleShare = (fileId: number) => {
    console.log("Sharing file:", fileId)
    // TODO: Implement share logic
  }

  const handleDelete = (fileId: number) => {
    console.log("Deleting file:", fileId)
    // TODO: Implement delete logic
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Recent Files</h1>
        <p className="text-muted-foreground">Files you've recently accessed or modified</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recent files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      {/* File count */}
      <div className="text-sm text-muted-foreground">{filteredFiles.length} recent files</div>

      {/* Recent files list */}
      <div className="space-y-4">
        {filteredFiles.map((file) => {
          const FileIcon = getFileIcon(file.type)

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
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(file.lastAccessed)}</span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(file.id)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(file.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Activity details */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={getActionColor(file.action)}>{file.action}</Badge>
                        {file.shared && (
                          <Badge variant="secondary" className="text-xs">
                            Shared
                          </Badge>
                        )}
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
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No recent files</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery ? "No files match your search" : "Your recently accessed files will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
