"use client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen } from "lucide-react"
import { useOcrProjects } from "@/hooks/use-ocr-projects"
import { ProjectList } from "@/components/ocr/project-list"

export default function OcrProjectsPage() {
  const { projects, loading, error } = useOcrProjects()

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-600">エラーが発生しました</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">アクティブ</Badge>
      case "completed":
        return <Badge variant="secondary">完了</Badge>
      case "archived":
        return <Badge variant="outline">アーカイブ</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">OCRプロジェクト管理</h1>
            <p className="text-gray-600 mt-2">PDF文書のOCR処理と自動組版プロジェクトを管理します</p>
          </div>
          <Button asChild>
            <Link href="/ocr-projects/new">
              <Plus className="h-4 w-4 mr-2" />
              新規プロジェクト作成
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-96">
              <FolderOpen className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">プロジェクトがありません</h3>
              <p className="text-gray-600 mb-4 text-center">
                最初のOCRプロジェクトを作成して、PDF文書の自動組版を始めましょう。
              </p>
              <Button asChild>
                <Link href="/ocr-projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新規プロジェクト作成
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ProjectList projects={projects} getStatusBadge={getStatusBadge} />
        )}
      </div>
    </div>
  )
}
