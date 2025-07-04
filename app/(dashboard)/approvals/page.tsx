"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Search, Eye, Check, X, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type Approval = Database["public"]["Tables"]["approvals"]["Row"] & {
  users?: {
    name: string | null
    email: string
  }
}

interface ApprovalStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function ApprovalsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchApprovals()
      fetchStats()
    }
  }, [user])

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from("approvals")
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setApprovals(data || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "承認申請の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from("approvals").select("status")

      if (error) throw error

      const stats = (data || []).reduce(
        (acc, approval) => {
          acc.total++
          if (approval.status === "pending") acc.pending++
          else if (approval.status === "approved") acc.approved++
          else if (approval.status === "rejected") acc.rejected++
          return acc
        },
        { pending: 0, approved: 0, rejected: 0, total: 0 },
      )

      setStats(stats)
    } catch (error) {
      console.error("統計データの取得に失敗:", error)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm("この申請を承認しますか？")) return

    try {
      const { error } = await supabase
        .from("approvals")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "成功",
        description: "申請を承認しました。",
      })

      fetchApprovals()
      fetchStats()
    } catch (error) {
      toast({
        title: "エラー",
        description: "承認処理に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm("この申請を却下しますか？")) return

    try {
      const { error } = await supabase
        .from("approvals")
        .update({
          status: "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "成功",
        description: "申請を却下しました。",
      })

      fetchApprovals()
      fetchStats()
    } catch (error) {
      toast({
        title: "エラー",
        description: "却下処理に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            承認待ち
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            <Check className="w-3 h-3 mr-1" />
            承認済み
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" />
            却下
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || approval.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">承認管理</h1>
          <p className="text-muted-foreground">申請の承認・却下管理</p>
        </div>
        <Link href="/approvals/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規申請
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認済み</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">却下</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総申請数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>申請を検索・フィルターできます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="タイトルまたはカテゴリで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="pending">承認待ち</SelectItem>
                <SelectItem value="approved">承認済み</SelectItem>
                <SelectItem value="rejected">却下</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">申請がありません</h3>
                <p className="text-muted-foreground mb-4">最初の申請を作成してみましょう。</p>
                <Link href="/approvals/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新規申請
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApprovals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{approval.title}</CardTitle>
                    <CardDescription>
                      {approval.category} - {approval.users?.name || approval.users?.email}
                      {approval.amount && ` - ¥${approval.amount.toLocaleString()}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(approval.status)}
                    <div className="flex space-x-1">
                      <Link href={`/approvals/${approval.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {approval.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(approval.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(approval.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{new Date(approval.created_at).toLocaleDateString("ja-JP")} 申請</Badge>
                  {approval.application_code && <Badge variant="secondary">{approval.application_code}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
