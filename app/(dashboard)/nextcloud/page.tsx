"use client"

import { useState, useEffect } from "react"
import { Cloud, File, Upload, Download, Trash2, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type NextcloudFile = Database["public"]["Tables"]["nextcloud_files"]["Row"]

const linkedTypeLabels = {
  approval: "承認申請",
  report: "日報",
  lead: "リード",
  task: "タスク",
}

const linkedTypeColors = {
  approval: "bg-purple-100 text-purple-800",
  report: "bg-blue-100 text-blue-800",
  lead: "bg-green-100 text-green-800",
  task: "bg-yellow-100 text-yellow-800",
}

export default function NextcloudPage() {
  const [files, setFiles] = useState<NextcloudFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("nextcloud_files")
        .select("*")
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
    } catch (error) {
      toast({
        title: "削除エラー",
        description: "ファイルの削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const downloadFile = (file: NextcloudFile) => {
    toast({
      title: "ダウンロード開始",
      description: `${file.file_name} のダウンロードを開始しました。`,
    })
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || file.linked_type === selectedType

    return matchesSearch && matchesType
  })

  const fileStats = {
    total: files.length,
    byType: {
      approval: files.filter((f) => f.linked_type === "approval").length,
      report: files.filter((f) => f.linked_type === "report").length,
      lead: files.filter((f) => f.linked_type === "lead").length,
      task: files.filter((f) => f.linked_type === "task").length,
    },
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nextcloud連携</h1>
          <p className="text-muted-foreground">システム内のファイルを一元管理します</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              ファイルアップロード
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>ファイルアップロード</DialogTitle>
              <DialogDescription>アップロードするファイルと関連付けるエンティティを選択してください</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                実際のファイルアップロードは個別のエンティティページから行えます。
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline">
                  <Link href="/approvals">承認申請へ</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/tasks">タスクへ</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/leads">リードへ</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/reports">日報へ</Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総ファイル数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">承認申請</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.byType.approval}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">日報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.byType.report}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">リード</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.byType.lead}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">タスク</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.byType.task}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            ファイル一覧
          </CardTitle>
          <CardDescription>システム内のすべてのファイルを表示します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ファイル名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="タイプで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのタイプ</SelectItem>
                <SelectItem value="approval">承認申請</SelectItem>
                <SelectItem value="report">日報</SelectItem>
                <SelectItem value="lead">リード</SelectItem>
                <SelectItem value="task">タスク</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchFiles}>
              <Filter className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ファイル名</TableHead>
                  <TableHead>関連タイプ</TableHead>
                  <TableHead>MIMEタイプ</TableHead>
                  <TableHead>アップロード日時</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        {file.file_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={linkedTypeColors[file.linked_type]}>{linkedTypeLabels[file.linked_type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{file.mime_type || "unknown"}</code>
                    </TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleString("ja-JP")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => downloadFile(file)} title="ダウンロード">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id)} title="削除">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || selectedType !== "all"
                  ? "検索条件に一致するファイルが見つかりません。"
                  : "ファイルがアップロードされていません。"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
