import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (folderName: string) => void
  isLoading: boolean
}

export function CreateFolderModal({ isOpen, onClose, onCreateFolder, isLoading }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("")

  const handleSubmit = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
    }
  }

  const handleCloseModal = () => {
    setFolderName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="folderName"
            placeholder="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="col-span-3"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseModal} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!folderName.trim() || isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
