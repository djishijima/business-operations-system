"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Edit, ArrowLeft, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
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

type Lead = Database["public"]["Tables"]["leads"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
}

const statusLabels = {
  new: "新規",
  contacted: "連絡済み",
  qualified: "見込み",
  lost: "失注",
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [lead, setLead] = useState<Lead | null>(null)
  const [assignedUser, setAssignedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchLead(params.id as string)
    }
  }, [params.id])

  const fetchLead = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).single()

      if (error) {
        console.error("Failed to fetch lead:", error)
        throw error
      }

      setLead(data)

      // 担当者情報を取得
      if (data.assigned_to) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", data.assigned_to).single()
        setAssignedUser(userData)
      }
    } catch (error: any) {
      console.error("Error fetching lead:", error)
      toast({
        title: "エラー",
        description: "リード情報の取得に失敗しました。",
        variant: "destructive",
      })
      router.push("/leads")
    } finally {
      setLoading(false)
    }
  }

  const deleteLead = async () => {
    if (!lead) return

    try {
      const { error } = await supabase.from("leads").delete().eq("id", lead.id)
      if (error) throw error

      toast({
        title: "成功",
        description: "リードを削除しました。",
      })
      router.push("/leads")
    } catch (error: any) {
      console.error("Failed to delete lead:", error)
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

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

  if (!lead) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">リードが見つかりません。</p>
            <Button asChild className="mt-4">
              <Link href="/leads">
                <ArrowLeft className="h-4 w-4 mr-2" />
                リード一覧に戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.name}</h1>
            <p className="text-muted-foreground">{lead.company_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/leads/${lead.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>リードを削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。リード「{lead.name}」の情報が完全に削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={deleteLead}>削除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">担当者名</label>
              <p className="text-lg">{lead.name}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">会社名</label>
              <p className="text-lg">{lead.company_name || "-"}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">ステータス</label>
              <div className="mt-1">
                <Badge className={statusColors[lead.status]}>{statusLabels[lead.status]}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>連絡先情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">メールアドレス</label>
              <p className="text-lg">{lead.contact_email || "-"}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">電話番号</label>
              <p className="text-lg">{lead.contact_phone || "-"}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">担当者</label>
              <p className="text-lg">
                {assignedUser ? `${assignedUser.name} (${assignedUser.employee_id})` : "未割り当て"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {lead.notes && (
        <Card>
          <CardHeader>
            <CardTitle>備考</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>システム情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">作成日時</label>
            <p>{new Date(lead.created_at).toLocaleString("ja-JP")}</p>
          </div>
          <Separator />
          <div>
            <label className="text-sm font-medium text-muted-foreground">更新日時</label>
            <p>{new Date(lead.updated_at).toLocaleString("ja-JP")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
