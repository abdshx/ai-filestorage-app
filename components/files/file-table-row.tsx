"use client"

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

interface FileTableRowProps {
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

export function FileTableRow({ file, onDownload, onShare, onDelete, onView }: FileTableRowProps) {
  const FileIcon = getFileIcon(file.type)

  // TODO: Implement actual file operations with backend API
  const handleDownload = () => {
    console.log("Downloading file:", file.id)
    onDownload?.(file.id)
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
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
      <div className="flex items-center space-x-3 flex-1">
        <div className="p-2 bg-muted rounded-lg">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{file.name}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{file.size}</span>
            <span>Modified {formatDate(file.modified)}</span>
            {file.shared && (
              <Badge variant="secondary" className="text-xs">
                Shared
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Quick actions - visible on hover */}
        <div className="hidden group-hover:flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={handleView} className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 w-8 p-0">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
    </div>
  )
}
