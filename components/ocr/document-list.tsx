"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, MoreHorizontal, Download, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useOcrDocuments } from "@/hooks/use-ocr-documents"

const statusColors = {
  uploaded: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
}

const statusLabels = {
  uploaded: "アップロード済み",
  processing: "処理中",
  completed: "完了",
  failed: "失敗",
}

interface DocumentListProps {
  projectId: string
}

export function DocumentList({ projectId }: DocumentListProps) {
  const { documents, loading, error, uploadDocument, deleteDocument } = useOcrDocuments(projectId)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await uploadDocument(projectId, file)
      // Reset input
      event.target.value = ""
    } catch (error) {
      alert(error instanceof Error ? error.message : "ファイルのアップロードに失敗しました")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この文書を削除してもよろしいですか？")) return

    try {
      setDeletingId(id)
      await deleteDocument(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : "文書の削除に失敗しました")
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">エラー: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">文書一覧</h2>
          <p className="text-gray-600 mt-1">OCR処理対象の文書を管理します</p>
        </div>
        <div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "アップロード中..." : "ファイルアップロード"}
            </label>
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">文書がありません</p>
            <div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-upload-empty"
              />
              <Button asChild disabled={uploading}>
                <label htmlFor="file-upload-empty" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  最初の文書をアップロード
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {document.original_filename}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatFileSize(document.file_size)} • {document.mime_type}
                      {document.page_count && ` • ${document.page_count}ページ`}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        ダウンロード
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(document.id)}
                        disabled={deletingId === document.id}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={statusColors[document.processing_status]}>
                      {statusLabels[document.processing_status]}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(document.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>

                  {document.processing_status === "processing" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>処理進行状況</span>
                        <span>処理中...</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}

                  {document.confidence_score && (
                    <div className="text-sm text-gray-600">
                      信頼度スコア: {(document.confidence_score * 100).toFixed(1)}%
                    </div>
                  )}

                  {document.processing_completed_at && (
                    <div className="text-sm text-gray-600">
                      処理完了: {new Date(document.processing_completed_at).toLocaleString("ja-JP")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
