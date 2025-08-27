"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText, ImageIcon, Video, Music, Archive, File, CheckCircle, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { getCurrentUser } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
  publicUrl?: string
  filePath?: string
}

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId?: string | null; // Optional folder ID for context
  onUploadSuccess?: () => void; // Callback to refresh parent component
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return Video
  if (type.startsWith("audio/")) return Music
  if (type === "application/pdf") return FileText
  if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return Archive
  if (type.includes("document") || type.includes("text")) return FileText
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function UploadModal({ open, onOpenChange, folderId, onUploadSuccess }: UploadModalProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
    }))
    setUploadFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((file) => file.id !== id))
  }

  // Real Supabase upload function
  const uploadToSupabase = async (fileData: UploadFile, userId: string) => {
    try {
      // Update status to uploading
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, status: "uploading", progress: 0 }
            : f
        )
      )

      // Upload file to Supabase storage
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('bucketName', 'files'); // Assuming 'files' is the default bucket
      formData.append('userId', userId);
      if (folderId) {
        formData.append('folderId', folderId);
      }

      const response = await axios.post('/api/uploadFiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === fileData.id
                  ? { ...f, progress: progress } : f
              )
            );
          }
        },
      });

      const result = response.data;

      // Update status to completed with file info
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                publicUrl: result.publicUrl,
                filePath: result.filePath,
              }
            : f
        )
      )

      return result
    } catch (error: any) {
      // Update status to error
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                status: "error",
                error: error.message || "Upload failed",
              }
            : f
        )
      )
      throw error
    }
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload files.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Upload all pending files to Supabase
      const uploadPromises = uploadFiles
        .filter((f) => f.status === "pending")
        .map((fileData) => uploadToSupabase(fileData, user.id))

      await Promise.all(uploadPromises)
      
      // Check if all uploads were successful
      const hasErrors = uploadFiles.some((f) => f.status === "error")
      
      if (!hasErrors) {
        // Call onUploadSuccess callback if provided
        onUploadSuccess?.();
        // Close modal after successful upload
        setTimeout(() => {
          onOpenChange(false)
          setUploadFiles([])
        }, 1000)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false)
      setUploadFiles([])
    }
  }

  const completedFiles = uploadFiles.filter((f) => f.status === "completed").length
  const totalFiles = uploadFiles.length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif">Upload Files</DialogTitle>
          <DialogDescription>Drag and drop files here or click to browse. Maximum file size: 100MB</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-foreground font-medium mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports all file types up to 100MB each</p>
              </div>
            )}
          </div>

          {/* File list */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Files to upload ({uploadFiles.length})</h3>
                {completedFiles > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {completedFiles}/{totalFiles} completed
                  </Badge>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadFiles.map((fileData) => {
                  const FileIcon = getFileIcon(fileData.file.type)
                  return (
                    <Card key={fileData.id} className="border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-muted rounded-lg">
                              <FileIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground truncate">{fileData.file.name}</p>
                              {fileData.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(fileData.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{formatFileSize(fileData.file.size)}</span>
                              <div className="flex items-center space-x-2">
                                {fileData.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {fileData.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                                <Badge
                                  className={
                                    fileData.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                      : fileData.status === "error"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                        : fileData.status === "uploading"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                  }
                                >
                                  {fileData.status}
                                </Badge>
                              </div>
                            </div>

                            {fileData.status === "uploading" && (
                              <div className="mt-2">
                                <Progress value={fileData.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">{fileData.progress}% uploaded</p>
                              </div>
                            )}

                            {fileData.status === "error" && fileData.error && (
                              <p className="text-xs text-red-600 mt-1">{fileData.error}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {uploadFiles.length > 0 && (
              <span>Total size: {formatFileSize(uploadFiles.reduce((acc, f) => acc + f.file.size, 0))}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadFiles.length === 0 || isUploading}
              className="bg-primary hover:bg-accent text-primary-foreground"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {uploadFiles.length} {uploadFiles.length === 1 ? "file" : "files"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
