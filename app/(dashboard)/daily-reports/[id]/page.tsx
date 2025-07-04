"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, User, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"] & {
  user?: {
    name: string
    employee_id: string
  }
  project?: {
    project_name: string
  }
}

export default function DailyReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .select(`
          *,
          user:users(name, employee_id),
          project:projects(project_name)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      setReport(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "日報の取得に失敗しました。",
        variant: "destructive",
      })
      router.push("/daily-reports")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">日報が見つかりません。</p>
          <Button asChild className="mt-4">
            <Link href="/daily-reports">日報一覧に戻る</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/daily-reports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            日報一覧
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">日報詳細</h1>
          <p className="text-muted-foreground">日報の詳細情報を表示しています</p>
        </div>
        <Button asChild>
          <Link href={`/daily-reports/${report.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>日報内容</CardTitle>
              <CardDescription>
                {new Date(report.report_date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{report.summary}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">報告日</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.report_date).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">作成者</p>
                  <p className="text-sm text-muted-foreground">
                    {report.user?.name} ({report.user?.employee_id})
                  </p>
                </div>
              </div>

              {report.project && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{report.project.project_name}</Badge>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">作成日時</p>
                  <p className="text-sm text-muted-foreground">{new Date(report.created_at).toLocaleString("ja-JP")}</p>
                </div>
              </div>

              {report.updated_at !== report.created_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">更新日時</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(report.updated_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/daily-reports/${report.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/daily-reports">一覧に戻る</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
