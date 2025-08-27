"use client"

import { UploadModal } from "./upload-modal"
import { useUploadModal } from "@/hooks/use-upload-modal"

export function UploadModalProvider() {
  const { isOpen, close } = useUploadModal()

  return <UploadModal open={isOpen} onOpenChange={close} />
}
