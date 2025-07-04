"use client"

import { useState, useEffect } from "react"
import { Download, Trash2, Eye, File, ImageIcon, FileText, Music, Video, Archive } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Database } from "@/lib/database.types"

type NextcloudFile = Database["public"]["Tables"]["nextcloud_files"]["Row"]

interface FileListProps {
  linkedType: "approval" | "report" | "lead" | "task"
  linkedId: string
  onFileDeleted?: () => void
}

const getMimeIcon = (mimeType: string | null) => {
  if (!mimeType) return File
  if (mimeType.startsWith("image/")) return ImageIcon
  if (mimeType.startsWith("video/")) return Video
  if (mimeType.startsWith("audio/")) return Music
  if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText
  if (mimeType.includes("zip") || mimeType.includes("archive")) return Archive
  return File
}

const getMimeTypeColor = (mimeType: string | null) => {
  if (!mimeType) return "bg-gray-100 text-gray-800"
  if (mimeType.startsWith("image/")) return "bg-green-100 text-green-800"
  if (mimeType.startsWith("video/")) return "bg-purple-100 text-purple-800"
  if (mimeType.startsWith("audio/")) return "bg-blue-100 text-blue-800"
  if (mimeType.includes("pdf")) return "bg-red-100 text-red-800"
  if (mimeType.includes("document")) return "bg-blue-100 text-blue-800"
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "bg-yellow-100 text-yellow-800"
  return "bg-gray-100 text-gray-800"
}

export function FileList({ linkedType, linkedId, onFileDeleted }: FileListProps) {
  const [files, setFiles] = useState<NextcloudFile[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchFiles()
  }, [linkedType, linkedId])

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("nextcloud_files")
        .select("*")
        .eq("linked_type", linkedType)
        .eq("linked_id", linkedId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase.from("nextcloud_files").delete().eq("id", fileId)

      if (error) throw error

      toast({
        title: "削除成功",
        description: "ファイルを削除しました。",
      })

      fetchFiles()
      onFileDeleted?.()
    } catch (error) {
      toast({
        title: "削除エラー",
        description: "ファイルの削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const downloadFile = (file: NextcloudFile) => {
    // シミュレーション：実際の実装では Nextcloud WebDAV API や Storage API を使用
    toast({
      title: "ダウンロード開始",
      description: `${file.file_name} のダウンロードを開始しました。`,
    })
  }

  const previewFile = (file: NextcloudFile) => {
    // シミュレーション：実際の実装では preview modal を開く
    toast({
      title: "プレビュー",
      description: `${file.file_name} のプレビューを開きます。`,
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>添付ファイル</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>添付ファイル ({files.length})</CardTitle>
        <CardDescription>
          この
          {linkedType === "approval"
            ? "承認申請"
            : linkedType === "report"
              ? "日報"
              : linkedType === "lead"
                ? "リード"
                : "タスク"}
          に添付されているファイルの一覧です
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">添付ファイルがありません。</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ファイル名</TableHead>
                  <TableHead>種類</TableHead>
                  <TableHead>アップロード日時</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => {
                  const IconComponent = getMimeIcon(file.mime_type)
                  return (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{file.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMimeTypeColor(file.mime_type)}>
                          {file.mime_type ? file.mime_type.split("/")[0] : "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(file.created_at).toLocaleString("ja-JP")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => previewFile(file)} title="プレビュー">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadFile(file)} title="ダウンロード">
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="削除">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ファイルを削除しますか？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  この操作は取り消せません。ファイル "{file.file_name}" が完全に削除されます。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteFile(file.id)}>削除</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
