"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, FolderOpen, Upload, Share2, TrendingUp, HardDrive } from "lucide-react"
import { useUploadModal } from "@/hooks/use-upload-modal"
import { CreateFolderModal } from "@/components/dashboard/create-folder-modal"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const uploadModal = useUploadModal()
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // TODO: Replace with actual data from backend/Supabase
  const stats = {
    totalFiles: 1247,
    totalStorage: "2.4 GB",
    storageUsed: 68, // percentage
    recentUploads: 23,
    sharedFiles: 12,
  }

  const recentFiles = [
    {
      id: 1,
      name: "Project Proposal.pdf",
      size: "2.4 MB",
      modified: "2 hours ago",
      type: "pdf",
    },
    {
      id: 2,
      name: "Design Assets.zip",
      size: "15.8 MB",
      modified: "1 day ago",
      type: "archive",
    },
    {
      id: 3,
      name: "Meeting Notes.docx",
      size: "1.2 MB",
      modified: "3 days ago",
      type: "document",
    },
  ]

  const handleCreateFolder = async (folderName: string) => {
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
        parentId: null, // Top-level folder for now
      });

      if (response.data.success) {
        toast({
          title: "Folder Created",
          description: `Folder "${folderName}" created successfully.`,
        });
        setIsCreateFolderModalOpen(false);
        router.push(`/newFolder/${response.data.folder.id}`); // Navigate to the new folder page
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

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">Here's an overview of your file storage and recent activity.</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={uploadModal.open}
          className="bg-primary hover:bg-accent text-primary-foreground"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
        <Button variant="outline" className="border-border bg-transparent" onClick={() => setIsCreateFolderModalOpen(true)}>
          <FolderOpen className="mr-2 h-4 w-4" />
          New Folder
        </Button>
        <Button variant="outline" className="border-border bg-transparent">
          <Share2 className="mr-2 h-4 w-4" />
          Share Files
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalFiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalStorage}</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.storageUsed}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.storageUsed}% of 10 GB used</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">In the last 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.sharedFiles}</div>
            <p className="text-xs text-muted-foreground">Currently shared</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent files */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif">Recent Files</CardTitle>
          <CardDescription>Your most recently accessed files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.size} • {file.modified}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
        isLoading={isCreatingFolder}
      />
    </div>
  )
}
