"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Eye, Edit, Trash2, FolderOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type OcrProject = Database["public"]["Tables"]["projects"]["Row"] & {
  document_count?: number
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  active: "進行中",
  completed: "完了",
  paused: "一時停止",
  cancelled: "キャンセル",
}

export default function OcrProjectsPage() {
  const [projects, setProjects] = useState<OcrProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          ocr_documents(count)
        `)
        .eq("type", "ocr")
        .order("created_at", { ascending: false })

      if (error) throw error

      const projectsWithCount = data?.map((project) => ({
        ...project,
        document_count: project.ocr_documents?.[0]?.count || 0,
      }))

      setProjects(projectsWithCount || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "OCRプロジェクトの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) throw error
      toast({ title: "成功", description: "OCRプロジェクトを削除しました。" })
      fetchProjects()
    } catch (error) {
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold">OCRプロジェクト</h1>
          <p className="text-muted-foreground">OCR・自動組版プロジェクトを管理します</p>
        </div>
        <Button asChild>
          <Link href="/ocr/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            新規プロジェクト作成
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>プロジェクト一覧</CardTitle>
          <CardDescription>登録されているOCRプロジェクトの一覧です</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="プロジェクト名、クライアント名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              フィルター
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>プロジェクト名</TableHead>
                  <TableHead>クライアント</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>ドキュメント数</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.project_name}</TableCell>
                    <TableCell>{project.client_name || "-"}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-4 w-4" />
                        {project.document_count || 0}件
                      </div>
                    </TableCell>
                    <TableCell>{new Date(project.created_at).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/ocr/projects/${project.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/ocr/projects/${project.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/ocr/projects/${project.id}/composer`}>
                            <FolderOpen className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>プロジェクトを削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。プロジェクトと関連するすべてのデータが削除されます。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProject(project.id)}>削除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "検索条件に一致するプロジェクトが見つかりません。" : "プロジェクトが登録されていません。"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
