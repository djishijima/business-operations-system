"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Settings } from "lucide-react"
import { DocumentList } from "@/components/ocr/document-list"
import { useOcrProjects, type OcrProject } from "@/hooks/use-ocr-projects"

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

export default function OcrProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProject } = useOcrProjects()
  const [project, setProject] = useState<OcrProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params.id as string

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProject(projectId)
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "プロジェクトの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, getProject])

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">エラー: {error}</div>
  }

  if (!project) {
    return <div className="text-center py-8">プロジェクトが見つかりません</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/ocr-projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/ocr-projects/${project.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Link>
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>プロジェクト情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ステータス</label>
                <div className="mt-1">
                  <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
                </div>
              </div>

              {(project.paper_width_mm || project.paper_height_mm) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">用紙サイズ</label>
                  <p className="mt-1 text-sm">
                    {project.paper_width_mm || "?"}mm × {project.paper_height_mm || "?"}mm
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">作成日</label>
                <p className="mt-1 text-sm">{new Date(project.created_at).toLocaleString("ja-JP")}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">最終更新</label>
                <p className="mt-1 text-sm">{new Date(project.updated_at).toLocaleString("ja-JP")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>処理統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">総文書数</label>
                <p className="mt-1 text-2xl font-bold">0</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">処理完了</label>
                <p className="mt-1 text-2xl font-bold text-green-600">0</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">処理中</label>
                <p className="mt-1 text-2xl font-bold text-yellow-600">0</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/ocr-composer">自動組版システム</Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                バッチ処理開始
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                結果エクスポート
              </Button>
            </CardContent>
          </Card>
        </div>

        <DocumentList projectId={projectId} />
      </div>
    </div>
  )
}
