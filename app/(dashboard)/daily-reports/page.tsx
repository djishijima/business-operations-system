"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"] & {
  users?: {
    name: string | null
    email: string
  }
}

export default function DailyReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "日報の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この日報を削除しますか？")) return

    try {
      const { error } = await supabase.from("daily_reports").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "成功",
        description: "日報を削除しました。",
      })

      fetchReports()
    } catch (error) {
      toast({
        title: "エラー",
        description: "日報の削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">日報管理</h1>
          <p className="text-muted-foreground">日次業務報告の管理</p>
        </div>
        <Link href="/daily-reports/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規作成
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>日報を検索できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="タイトルまたは内容で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">日報がありません</h3>
                <p className="text-muted-foreground mb-4">最初の日報を作成してみましょう。</p>
                <Link href="/daily-reports/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新規作成
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>
                      {new Date(report.date).toLocaleDateString("ja-JP")} - {report.users?.name || report.users?.email}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/daily-reports/${report.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/daily-reports/${report.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(report.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{report.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline">{new Date(report.created_at).toLocaleDateString("ja-JP")} 作成</Badge>
                  {report.project_id && <Badge variant="secondary">プロジェクト連携</Badge>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
