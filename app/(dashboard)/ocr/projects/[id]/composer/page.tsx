"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Download, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type OcrProject = Database["public"]["Tables"]["projects"]["Row"]
type OcrDocument = Database["public"]["Tables"]["ocr_documents"]["Row"]

export default function OcrComposerPage() {
  const params = useParams()
  const { toast } = useToast()
  const [project, setProject] = useState<OcrProject | null>(null)
  const [documents, setDocuments] = useState<OcrDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [composerUrl, setComposerUrl] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchProjectData(params.id as string)
    }
  }, [params.id])

  const fetchProjectData = async (id: string) => {
    try {
      // プロジェクト情報を取得
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("type", "ocr")
        .single()

      if (projectError) throw projectError

      // ドキュメント一覧を取得
      const { data: documentsData, error: documentsError } = await supabase
        .from("ocr_documents")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })

      if (documentsError) throw documentsError

      setProject(projectData)
      setDocuments(documentsData || [])

      // Google AI Studio URLを生成（実際のプロジェクトIDを使用）
      setComposerUrl(`https://aistudio.google.com/app/prompts/new?project=${id}`)
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロジェクトデータの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshComposer = () => {
    const iframe = document.getElementById("composer-iframe") as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">プロジェクトが見つかりません。</p>
          <Button asChild className="mt-4">
            <Link href="/ocr/projects">プロジェクト一覧に戻る</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/ocr/projects/${project.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            プロジェクト詳細
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">自動組版 - {project.project_name}</h1>
          <p className="text-muted-foreground">Google AI Studioを使用した自動組版作業</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshComposer}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={composerUrl} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              新しいタブで開く
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>AI Studio 組版エディタ</CardTitle>
              <CardDescription>Google AI Studioでドキュメントの自動組版を行います</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[800px] border rounded-lg overflow-hidden">
                <iframe
                  id="composer-iframe"
                  src={composerUrl}
                  className="w-full h-full border-0"
                  title="Google AI Studio Composer"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">プロジェクト情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">プロジェクト名</p>
                <p className="text-sm text-muted-foreground">{project.project_name}</p>
              </div>

              {project.client_name && (
                <div>
                  <p className="text-sm font-medium">クライアント</p>
                  <p className="text-sm text-muted-foreground">{project.client_name}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">ステータス</p>
                <Badge variant="outline">{project.status}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium">ドキュメント数</p>
                <p className="text-sm text-muted-foreground">{documents.length}件</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ドキュメント一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{doc.status}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ドキュメントがアップロードされていません
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/ocr/projects/${project.id}/upload`}>ドキュメントアップロード</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href={`/ocr/projects/${project.id}`}>プロジェクト詳細</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
