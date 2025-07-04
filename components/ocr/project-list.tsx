"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useOcrProjects } from "@/hooks/use-ocr-projects"

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

export function ProjectList() {
  const { projects, loading, error, deleteProject } = useOcrProjects()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("このプロジェクトを削除してもよろしいですか？")) return

    try {
      setDeletingId(id)
      await deleteProject(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : "プロジェクトの削除に失敗しました")
    } finally {
      setDeletingId(null)
    }
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
          <h1 className="text-3xl font-bold">OCRプロジェクト</h1>
          <p className="text-gray-600 mt-2">PDF文書のOCR処理と自動組版プロジェクトを管理します</p>
        </div>
        <Button asChild>
          <Link href="/ocr-projects/new">
            <Plus className="h-4 w-4 mr-2" />
            新規プロジェクト
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">プロジェクトがありません</p>
            <Button asChild>
              <Link href="/ocr-projects/new">
                <Plus className="h-4 w-4 mr-2" />
                最初のプロジェクトを作成
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/ocr-projects/${project.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          詳細表示
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/ocr-projects/${project.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
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
                    <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(project.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>

                  {(project.paper_width_mm || project.paper_height_mm) && (
                    <div className="text-sm text-gray-600">
                      用紙サイズ: {project.paper_width_mm || "?"}mm × {project.paper_height_mm || "?"}mm
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                      <Link href={`/ocr-projects/${project.id}`}>詳細表示</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
