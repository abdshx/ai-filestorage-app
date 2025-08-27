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
  RotateCcw,
  Trash2,
  AlertTriangle,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
} from "lucide-react"

// TODO: Replace with actual trash data from backend
const mockTrashFiles = [
  {
    id: 1,
    name: "Old Presentation.pptx",
    type: "document",
    size: "5.2 MB",
    deletedDate: "2024-01-10T14:30:00Z",
    originalLocation: "/Projects/Marketing",
    daysUntilPermanentDelete: 25,
  },
  {
    id: 2,
    name: "Unused Logo.png",
    type: "image",
    size: "1.8 MB",
    deletedDate: "2024-01-08T09:15:00Z",
    originalLocation: "/Design/Assets",
    daysUntilPermanentDelete: 23,
  },
  {
    id: 3,
    name: "Draft Document.docx",
    type: "document",
    size: "2.1 MB",
    deletedDate: "2024-01-05T16:45:00Z",
    originalLocation: "/Documents",
    daysUntilPermanentDelete: 20,
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function TrashPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = mockTrashFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // TODO: Implement actual file operations with backend API
  const handleRestore = (fileId: number) => {
    console.log("Restoring file:", fileId)
    // TODO: Implement restore logic
  }

  const handlePermanentDelete = (fileId: number) => {
    console.log("Permanently deleting file:", fileId)
    // TODO: Implement permanent delete logic with confirmation
  }

  const handleEmptyTrash = () => {
    console.log("Emptying trash")
    // TODO: Implement empty trash logic with confirmation
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Trash</h1>
          <p className="text-muted-foreground">Files will be permanently deleted after 30 days</p>
        </div>

        {filteredFiles.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleEmptyTrash}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Empty Trash
          </Button>
        )}
      </div>

      {/* Warning notice */}
      {filteredFiles.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="flex items-center space-x-3 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              Files in trash will be permanently deleted after 30 days. Restore important files before they're gone
              forever.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search trash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      {/* File count */}
      {filteredFiles.length > 0 && (
        <div className="text-sm text-muted-foreground">{filteredFiles.length} files in trash</div>
      )}

      {/* Trash files list */}
      <div className="space-y-4">
        {filteredFiles.map((file) => {
          const FileIcon = getFileIcon(file.type)
          const isExpiringSoon = file.daysUntilPermanentDelete <= 7

          return (
            <Card key={file.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* File icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center opacity-60">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>

                  {/* File details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate opacity-75">{file.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>{file.size}</span>
                          <span>Deleted {formatDate(file.deletedDate)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Original location: {file.originalLocation}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRestore(file.id)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePermanentDelete(file.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Forever
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Expiration warning */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            isExpiringSoon
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }
                        >
                          {isExpiringSoon && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {file.daysUntilPermanentDelete} days left
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(file.id)}
                          className="border-border"
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
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
            <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Trash is empty</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery ? "No files match your search" : "Deleted files will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
