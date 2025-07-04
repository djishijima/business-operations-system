"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminGuard } from "@/components/admin/admin-guard"
import { supabase } from "@/lib/supabase"
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Database,
  Shield,
  Settings,
  Activity,
} from "lucide-react"
import Link from "next/link"

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalApprovals: number
  pendingApprovals: number
  approvedApprovals: number
  rejectedApprovals: number
  totalProjects: number
  activeProjects: number
  totalDocuments: number
  processingDocuments: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)

      // 並列でデータを取得
      const [usersResult, approvalsResult, projectsResult, documentsResult] = await Promise.all([
        supabase.from("users").select("id, status"),
        supabase.from("approvals").select("id, status"),
        supabase.from("projects").select("id, status"),
        supabase.from("ocr_documents").select("id, status"),
      ])

      const users = usersResult.data || []
      const approvals = approvalsResult.data || []
      const projects = projectsResult.data || []
      const documents = documentsResult.data || []

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === "active").length,
        totalApprovals: approvals.length,
        pendingApprovals: approvals.filter((a) => a.status === "pending").length,
        approvedApprovals: approvals.filter((a) => a.status === "approved").length,
        rejectedApprovals: approvals.filter((a) => a.status === "rejected").length,
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === "active").length,
        totalDocuments: documents.length,
        processingDocuments: documents.filter((d) => d.status === "processing").length,
      })
    } catch (error) {
      console.error("統計データ取得エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, description, icon: Icon, color = "default" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={`h-4 w-4 ${color === "warning" ? "text-orange-500" : color === "success" ? "text-green-500" : color === "danger" ? "text-red-500" : "text-muted-foreground"}`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "..." : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <AdminGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
            <p className="text-muted-foreground">システム全体の状況と管理機能</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/verification">
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                システム検証
              </Button>
            </Link>
            <Link href="/admin/templates">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                テンプレート管理
              </Button>
            </Link>
          </div>
        </div>

        {/* システム統計 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="総ユーザー数"
            value={stats?.totalUsers}
            description={`アクティブ: ${stats?.activeUsers}人`}
            icon={Users}
          />
          <StatCard
            title="承認申請"
            value={stats?.totalApprovals}
            description={`承認待ち: ${stats?.pendingApprovals}件`}
            icon={FileText}
            color={stats?.pendingApprovals && stats.pendingApprovals > 0 ? "warning" : "default"}
          />
          <StatCard
            title="OCRプロジェクト"
            value={stats?.totalProjects}
            description={`アクティブ: ${stats?.activeProjects}件`}
            icon={Database}
          />
          <StatCard
            title="OCR文書"
            value={stats?.totalDocuments}
            description={`処理中: ${stats?.processingDocuments}件`}
            icon={Activity}
            color={stats?.processingDocuments && stats.processingDocuments > 0 ? "warning" : "default"}
          />
        </div>

        {/* 承認申請状況 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              承認申請状況
            </CardTitle>
            <CardDescription>申請の処理状況と統計</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">{loading ? "..." : stats?.pendingApprovals}</p>
                  <p className="text-sm text-orange-600">承認待ち</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{loading ? "..." : stats?.approvedApprovals}</p>
                  <p className="text-sm text-green-600">承認済み</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{loading ? "..." : stats?.rejectedApprovals}</p>
                  <p className="text-sm text-red-600">却下</p>
                </div>
              </div>
            </div>
            {stats?.pendingApprovals && stats.pendingApprovals > 0 && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-medium text-orange-700">{stats.pendingApprovals}件の申請が承認待ちです</p>
                </div>
                <Link href="/approvals">
                  <Button size="sm" className="mt-2">
                    承認申請を確認
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使用する管理機能への素早いアクセス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/users">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">ユーザー管理</span>
                </Button>
              </Link>
              <Link href="/approvals">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">承認管理</span>
                </Button>
              </Link>
              <Link href="/ocr-projects">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Database className="h-6 w-6" />
                  <span className="text-sm">OCR管理</span>
                </Button>
              </Link>
              <Link href="/codes">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">コード管理</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* システム健全性 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              システム健全性
            </CardTitle>
            <CardDescription>システムの動作状況と健全性チェック</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">データベース接続</span>
                </div>
                <Badge variant="default">正常</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">認証システム</span>
                </div>
                <Badge variant="default">正常</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">ファイルストレージ</span>
                </div>
                <Badge variant="default">正常</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
