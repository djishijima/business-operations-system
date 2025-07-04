"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckSquare, FileText, TrendingUp, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

interface DashboardStats {
  totalReports: number
  pendingApprovals: number
  completedTasks: number
  activeProjects: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingApprovals: 0,
    completedTasks: 0,
    activeProjects: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const [reportsResult, approvalsResult, tasksResult, projectsResult] = await Promise.all([
        supabase.from("daily_reports").select("id", { count: "exact" }).eq("user_id", user?.id),
        supabase.from("approvals").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("tasks").select("id", { count: "exact" }).eq("status", "completed"),
        supabase.from("projects").select("id", { count: "exact" }).eq("status", "active"),
      ])

      setStats({
        totalReports: reportsResult.count || 0,
        pendingApprovals: approvalsResult.count || 0,
        completedTasks: tasksResult.count || 0,
        activeProjects: projectsResult.count || 0,
      })
    } catch (error) {
      console.error("統計データの取得に失敗:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground">業務管理システムの概要</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="w-4 h-4 mr-1" />
          {new Date().toLocaleDateString("ja-JP")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">日報件数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">今月の日報作成数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">承認待ちの申請</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了タスク</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">今月完了したタスク</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中プロジェクト</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">アクティブなプロジェクト</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使用する機能へのショートカット</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/daily-reports/new">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                新しい日報を作成
              </Button>
            </Link>
            <Link href="/approvals/new">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                新しい申請を作成
              </Button>
            </Link>
            <Link href="/tasks/new">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <CheckSquare className="w-4 h-4 mr-2" />
                新しいタスクを作成
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>システム情報</CardTitle>
            <CardDescription>現在のシステム状態</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">ログインユーザー</span>
              <Badge variant="secondary">{user?.email}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">システム状態</span>
              <Badge variant="default">正常稼働中</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">最終更新</span>
              <span className="text-sm text-muted-foreground">{new Date().toLocaleString("ja-JP")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
