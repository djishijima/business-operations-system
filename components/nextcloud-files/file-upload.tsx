"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X, File, ImageIcon, FileText, Music, Video, Archive } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

interface FileUploadProps {
  linkedType: "approval" | "report" | "lead" | "task"
  linkedId: string
  onUploadSuccess?: () => void
}

const getMimeIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return ImageIcon
  if (mimeType.startsWith("video/")) return Video
  if (mimeType.startsWith("audio/")) return Music
  if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText
  if (mimeType.includes("zip") || mimeType.includes("archive")) return Archive
  return File
}

export function FileUpload({ linkedType, linkedId, onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    setSelectedFiles(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    setSelectedFiles(files)
  }

  const uploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        // シミュレーション：実際の実装では Nextcloud WebDAV API や Storage API を使用
        const filePath = `uploads/${linkedType}/${linkedId}/${Date.now()}-${file.name}`

        // ファイル情報をデータベースに保存
        const { error } = await supabase.from("nextcloud_files").insert({
          linked_type: linkedType,
          linked_id: linkedId,
          file_path: filePath,
          file_name: file.name,
          mime_type: file.type,
          uploaded_by: user?.id || null,
        })

        if (error) throw error
        return { file: file.name, path: filePath }
      })

      const results = await Promise.all(uploadPromises)

      toast({
        title: "アップロード成功",
        description: `${results.length}個のファイルをアップロードしました。`,
      })

      setSelectedFiles(null)
      onUploadSuccess?.()
    } catch (error: any) {
      toast({
        title: "アップロードエラー",
        description: error.message || "ファイルのアップロードに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles)
    newFiles.splice(index, 1)

    // Create new FileList-like object
    const dataTransfer = new DataTransfer()
    newFiles.forEach((file) => dataTransfer.items.add(file))
    setSelectedFiles(dataTransfer.files)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          ファイルアップロード
        </CardTitle>
        <CardDescription>
          {linkedType === "approval" && "承認申請"}
          {linkedType === "report" && "日報"}
          {linkedType === "lead" && "リード"}
          {linkedType === "task" && "タスク"}
          に添付するファイルをアップロードします
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <div className="space-y-2">
            <p className="text-sm font-medium">ファイルをドラッグ&ドロップするか、クリックして選択してください</p>
            <p className="text-xs text-gray-500">最大10MB、対応形式：画像、PDF、文書、アーカイブファイル</p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">選択されたファイル ({selectedFiles.length})</h4>
            <div className="space-y-2">
              {Array.from(selectedFiles).map((file, index) => {
                const IconComponent = getMimeIcon(file.type)
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
            <Button onClick={uploadFiles} disabled={uploading} className="w-full">
              {uploading ? "アップロード中..." : "アップロード開始"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
