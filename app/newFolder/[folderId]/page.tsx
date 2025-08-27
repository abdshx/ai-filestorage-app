"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { useParams, useRouter } from "next/navigation"
import { CreateFolderModal } from "@/components/dashboard/create-folder-modal"
import { UploadModal } from "@/components/upload/upload-modal"

interface FileItem {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  is_shared: boolean;
  public_url: string | null;
  file_path: string;
  folder_id: string | null; // Added folder_id
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

export default function NewFolderPage() {
  const params = useParams()
  const currentFolderId = params.folderId as string || null;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("")
  const uploadModal = useUploadModal()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([]) // State for subfolders
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);

  const filteredItems = [...folders, ...files].filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fetchFolderDetails = async (folderId: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view folder contents.",
          variant: "destructive",
        });
        return null;
      }
      const response = await axios.get(`/api/getFolderDetails?folderId=${folderId}&userId=${user.id}`);
      if (response.data.success) {
        setCurrentFolder(response.data.folder);
        return response.data.folder;
      } else {
        setError(response.data.error || "Failed to fetch folder details.");
        return null;
      }
    } catch (err: any) {
      console.error('Failed to fetch folder details:', err);
      setError(err.response?.data?.error || 'Failed to load folder details. Please try again.');
      return null;
    }
  }

  const fetchFilesAndFolders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('Authentication error:', userError);
        setError('Authentication required to view files.');
        setIsLoading(false);
        return ;
      }

      // Fetch current folder details
      let folderData = null;
      if (currentFolderId && currentFolderId !== '00000000-0000-0000-0000-000000000000') {
        folderData = await fetchFolderDetails(currentFolderId);
        if (!folderData) {
          setIsLoading(false);
          return;
        }
      }

      // Fetch files
      const filesResponse = await axios.get(`/api/getFiles?userId=${user.id}&folderId=${currentFolderId || '00000000-0000-0000-0000-000000000000'}`);
      setFiles(filesResponse.data.files)

      // Fetch subfolders (if current folder is not root)
      if (currentFolderId && currentFolderId !== '00000000-0000-0000-0000-000000000000') {
        const foldersResponse = await axios.get(`/api/getFolders?userId=${user.id}&parentId=${currentFolderId}`);
        setFolders(foldersResponse.data.folders);
      } else {
        // For root, fetch all top-level folders
        const foldersResponse = await axios.get(`/api/getFolders?userId=${user.id}&parentId=null`);
        setFolders(foldersResponse.data.folders);
      }

    } catch (err) {
      console.error('Failed to fetch items:', err)
      setError('Failed to load items. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFilesAndFolders()
  }, [currentFolderId]) // Re-fetch when folderId changes

  const handleCreateFolder = async (folderName: string, parentId: string | null) => {
    setIsCreatingFolder(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create folders.",
          variant: "destructive",
        });
        setIsCreatingFolder(false);
        return;
      }

      const response = await axios.post('/api/createFolder', {
        name: folderName,
        userId: user.id,
        parentId: parentId,
      });

      if (response.data.success) {
        toast({
          title: "Folder Created",
          description: `Folder "${folderName}" created successfully.`,
        });
        setIsCreateFolderModalOpen(false);
        fetchFilesAndFolders(); // Refresh list after creating new folder
      } else {
        toast({
          title: "Folder Creation Failed",
          description: response.data.error || "Could not create folder.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast({
        title: "Folder Creation Error",
        description: error.response?.data?.error || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFolder(false);
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{currentFolder?.name || "My Files"}</h1>
          <p className="text-muted-foreground mt-2">Manage and organize your files and folders.</p>
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
        {isLoading ? "Loading items..." : error ? "" : `${filteredItems.length} items found`}
      </div>

      {isLoading && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-foreground mb-2">Loading items...</h3>
            <p className="text-muted-foreground text-center mb-4">Please wait while we fetch your items.</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-border bg-red-50 dark:bg-red-950">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <X className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Error loading items</h3>
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
          {/* Combined Folder/File List */}
          {filteredItems.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const IconComponent = ('file_type' in item) ? getFileIcon(item.file_type) : FolderPlus;
                  return (
                  <Card key={item.id} className="border-border hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
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
                      </div>
                    </CardContent>
                  </Card>
                )})}
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
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => {
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
                    )})}
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
        onCreateFolder={(name) => handleCreateFolder(name, currentFolderId)}
        isLoading={isCreatingFolder}
      />
      <UploadModal
        open={uploadModal.isOpen}
        onOpenChange={uploadModal.close}
        folderId={currentFolderId}
        onUploadSuccess={fetchFilesAndFolders}
      />
    </div>
  )
}
