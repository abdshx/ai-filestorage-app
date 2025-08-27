"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Eye,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
} from "lucide-react"

interface FileCardProps {
  file: {
    id: number
    name: string
    type: string
    size: string
    modified: string
    shared?: boolean
    thumbnail?: string | null
  }
  onDownload?: (id: number) => void
  onShare?: (id: number) => void
  onDelete?: (id: number) => void
  onView?: (id: number) => void
}

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

export function FileCard({ file, onDownload, onShare, onDelete, onView }: FileCardProps) {
  const FileIcon = getFileIcon(file.type)

  // TODO: Implement actual file operations with backend API
  const handleDownload = () => {
    const downloadUrl = `/api/downloadFile?fileId=${file.id}`;
    window.open(downloadUrl, "_blank");
    onDownload?.(file.id);
  }

  const handleShare = () => {
    console.log("Sharing file:", file.id)
    onShare?.(file.id)
  }

  const handleDelete = () => {
    console.log("Deleting file:", file.id)
    onDelete?.(file.id)
  }

  const handleView = () => {
    console.log("Viewing file:", file.id)
    onView?.(file.id)
  }

  return (
    <Card className="border-border hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {file.thumbnail ? (
              <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden">
                <img
                  src={file.thumbnail || "/placeholder.svg"}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                <FileIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-foreground text-sm truncate flex-1 mr-2">{file.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{file.size}</span>
            {file.shared && (
              <Badge variant="secondary" className="text-xs">
                Shared
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground">Modified {formatDate(file.modified)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
