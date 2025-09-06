"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Upload,
  FolderPlus,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
  X,
  RefreshCcw,
} from "lucide-react"
import { useUploadModal } from "@/hooks/use-upload-modal"
import axios from "axios"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";
import { CreateFolderModal } from "@/components/dashboard/create-folder-modal";
import { UploadModal } from "@/components/upload/upload-modal";

interface FileItem {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  is_shared: boolean;
  public_url: string | null;
  file_path: string;
  status: string;
  tags: string[];
  summary: string | null;
  keywords: string[];
  processed_at: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default function FilesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const uploadModal = useUploadModal()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([]) // State for folders
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [shareLink, setShareLink] = useState<string | null>(null);
  const router = useRouter();
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);


  const filteredItems = [...folders, ...files].filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const fetchFilesAndFolders = async () => {
    setIsLoading(true)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError);
      setError('Authentication required to view files.');
      setIsLoading(false);
      return ;
    }
    setError(null)
    try {
      const filesResponse = await axios.get(`/api/getFiles?userId=${user.id}&folderId=00000000-0000-0000-0000-000000000000`)
      setFiles(filesResponse.data.files)

      // Fetch top-level folders
      const foldersResponse = await axios.get(`/api/getFolders?userId=${user.id}&parentId=null`);
      setFolders(foldersResponse.data.folders);

    } catch (err) {
      console.error('Failed to fetch files:', err)
      setError('Failed to load files. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFilesAndFolders();
  }, [])

  // TODO: Implement actual file operations with Supabase storage
  const handleDownload = (fileId: string) => {
    console.log("Downloading file:", fileId)
    // TODO: Implement download logic
  }

  
  
  
  const handleShare = async (fileId: string, filePath: string) => {
    console.log("Sharing file:", fileId)


    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Authentication error:', userError);
      setError('Authentication required to delete files.');
      setIsLoading(false);
      return ;
    }

    try {
      const response = await axios.post('/api/shareFile', {
        fileId,
        filePath,
        userId: user.id,
        expiresInSeconds: 3600, // 1 hour expiration
      });

      console.log("back")
      if (response.data.success) {

        console.log(response.data.shareableLink)
        // Display the shareable link to the user
        toast({          
          title: "File Shared!",
          description: `Shareable link: ${response.data.shareableLink}`,
          duration: 5000, // Show for 5 seconds
        });
        // Optionally, copy to clipboard here
        navigator.clipboard.writeText(response.data.shareableLink);
        setShareLink(response.data.shareableLink); // Set the link to open the dialog
      } else {
        toast({
          title: "Sharing Failed",
          description: response.data.error || "Could not generate shareable link.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error sharing file:', error);
      toast({
        title: "Sharing Error",
        description: error.response?.data?.error || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  const handleDelete = async (fileId: string, filePath: string) => {
    console.log("Deleting file:", fileId)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Authentication error:', userError);
      setError('Authentication required to delete files.');
      setIsLoading(false);
      return ;
    }
    
    try {
      await axios.delete(`/api/deleteFile?userId=${user.id}`, {
        data: { fileId, filePath },
      });
      fetchFilesAndFolders(); // Refetch files to update the list
    } catch (error) {
      console.error('Error deleting file:', error);
      // Optionally show a toast notification for the error
    }
  }

  const handleCreateFolder = async (name: string, parentId: string | null) => {
    setIsCreatingFolder(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setIsCreatingFolder(false);
      toast({
        title: "Error creating folder",
        description: "Authentication required to create folders.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post('/api/createFolder', {
        name,
        userId: user.id,
        parentId,
      });

      if (response.data.success) {
        toast({
          title: "Folder created",
          description: `Folder "${name}" created.`,
        });
        setIsCreateFolderModalOpen(false);
        fetchFilesAndFolders(); // Refetch to show the new folder
      } else {
        toast({
          title: "Folder creation failed",
          description: response.data.error || "Could not create folder.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast({
        title: "Folder creation error",
        description: error.response?.data?.error || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Files</h1>
          <p className="text-muted-foreground">Manage and organize your files</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={uploadModal.open}
            className="bg-primary hover:bg-accent text-primary-foreground"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Button variant="outline" className="border-border bg-transparent" onClick={() => setIsCreateFolderModalOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File count */}
      <div className="text-sm text-muted-foreground">
        {isLoading ? "Loading files..." : error ? "" : `${filteredItems.length} files found`}
      </div>

      {isLoading && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-foreground mb-2">Loading files...</h3>
            <p className="text-muted-foreground text-center mb-4">Please wait while we fetch your files.</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-border bg-red-50 dark:bg-red-950">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <X className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Error loading files</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={fetchFilesAndFolders} className="bg-red-600 hover:bg-red-700 text-white">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
      {/* Files grid/list */}
      {filteredItems.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
                const IconComponent = ('file_type' in item) ? getFileIcon(item.file_type) : FolderPlus;
            return (
              <Card key={item.id} className="border-border hover:shadow-md transition-shadow" onClick={() => {
                if (('file_type' in item)) {
                  // Handle file click if needed
                } else {
                  // Handle folder click (navigate)
                  router.push(`/newFolder/${item.id}`);
                }
              }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                          {'file_type' in item && item.public_url ? (
                        <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden">
                          <img
                                src={item.public_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <IconComponent className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-foreground text-sm truncate flex-1 mr-2">{item.name}</h3>
                      {'file_type' in item && item.status === 'processing' && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800">
                          Processing
                        </Badge>
                      )}
                      {'file_type' in item && item.status === 'ready' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800">
                          Ready
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {'file_type' in item && (
                            <>
                              <DropdownMenuItem onClick={() => handleDownload(item.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(item.id, item.file_path)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => ('file_type' in item) ? handleDelete(item.id, item.file_path) : console.log('Delete folder', item.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {'file_type' in item ? (
                            <span>{formatFileSize(item.file_size)}</span>
                          ) : (
                            <span>Folder</span>
                          )}
                          {'file_type' in item && item.is_shared && (
                        <Badge variant="secondary" className="text-xs">
                          Shared
                        </Badge>
                      )}
                    </div>

                        <p className="text-xs text-muted-foreground">Modified {formatDate(item.created_at)}</p>
                        {'file_type' in item && item.status === 'ready' && (
                          <div className="mt-2 text-xs">
                            {item.tags && item.tags.length > 0 && (
                              <div className="mb-1">
                                <p className="font-semibold text-foreground">Keywords:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-bold">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.summary && (
                              <div>
                                <p className="font-semibold text-foreground">Summary:</p>
                                <p className="text-muted-foreground mt-1">{item.summary}</p>
                              </div>
                            )}
                          </div>
                        )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredItems.map((item) => {
                    const IconComponent = ('file_type' in item) ? getFileIcon(item.file_type) : FolderPlus;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors" onClick={() => {
                      if (('file_type' in item)) {
                        // Handle file click if needed
                      } else {
                        // Handle folder click (navigate)
                        router.push(`/newFolder/${item.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        {'file_type' in item && item.status === 'processing' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800">
                            Processing
                          </Badge>
                        )}
                        {'file_type' in item && item.status === 'ready' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800">
                            Ready
                          </Badge>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {'file_type' in item ? (
                                <span>{formatFileSize(item.file_size)}</span>
                              ) : (
                                <span>Folder</span>
                              )}
                              <span>Modified {formatDate(item.created_at)}</span>
                              {'file_type' in item && item.is_shared && (
                            <Badge variant="secondary" className="text-xs">
                              Shared
                            </Badge>
                          )}
                        </div>
                        {'file_type' in item && item.status === 'ready' && (
                          <div className="mt-2 text-xs">
                            {item.tags && item.tags.length > 0 && (
                              <div className="mb-1">
                                <p className="font-semibold text-foreground">Keywords:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-bold">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.summary && (
                              <div>
                                <p className="font-semibold text-foreground">Summary:</p>
                                <p className="text-muted-foreground mt-1">{item.summary}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {'file_type' in item && (
                          <>
                            <DropdownMenuItem onClick={() => handleDownload(item.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(item.id, item.file_path)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => ('file_type' in item) ? handleDelete(item.id, item.file_path) : console.log('Delete folder', item.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )
        ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Upload your first file or create a folder to get started"}
            </p>
            <Button onClick={uploadModal.open} className="bg-primary hover:bg-accent text-primary-foreground">
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <Button variant="outline" className="border-border bg-transparent mt-2" onClick={() => setIsCreateFolderModalOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </CardContent>
        </Card>
      )}
        </>
      )}
      {shareLink && (
        <AlertDialog open={!!shareLink} onOpenChange={() => setShareLink(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Share File Link</AlertDialogTitle>
              <AlertDialogDescription className="break-all">
                {shareLink}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={() => {
                if (shareLink) {
                  navigator.clipboard.writeText(shareLink);
                  toast({
                    title: "Copied to clipboard!",
                    description: "The shareable link has been copied.",
                  });
                }
                setShareLink(null);
              }}>
                Copy Link
              </Button>
              <Button variant="outline" onClick={() => setShareLink(null)}>Close</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreateFolder={(name) => handleCreateFolder(name, null)} // Always create top-level folders here
        isLoading={isCreatingFolder}
      />
      <UploadModal
        open={uploadModal.isOpen}
        onOpenChange={uploadModal.close}
        folderId={null} // For root folder uploads
        onUploadSuccess={fetchFilesAndFolders}
      />
    </div>
  )
} 