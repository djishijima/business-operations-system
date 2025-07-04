"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Trash2, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

type PaymentRecipient = Database["public"]["Tables"]["payment_recipients"]["Row"]

const accountTypeLabels = {
  ordinary: "普通",
  checking: "当座",
}

export default function PaymentsPage() {
  const [recipients, setRecipients] = useState<PaymentRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipients()
  }, [])

  const fetchRecipients = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_recipients")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setRecipients(data || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "支払先の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteRecipient = async (id: string) => {
    try {
      const { error } = await supabase.from("payment_recipients").delete().eq("id", id)
      if (error) throw error
      toast({ title: "成功", description: "支払先を削除しました。" })
      fetchRecipients()
    } catch (error) {
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipient.bank_name && recipient.bank_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (recipient.email && recipient.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">支払先管理</h1>
          <p className="text-muted-foreground">銀行口座と受取人情報を管理します</p>
        </div>
        <Button asChild>
          <Link href="/payments/new">
            <Plus className="h-4 w-4 mr-2" />
            新規支払先追加
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>支払先一覧</CardTitle>
          <CardDescription>登録されている支払先の一覧です</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="受取人名、銀行名、メールアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              フィルター
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>受取人名</TableHead>
                  <TableHead>銀行情報</TableHead>
                  <TableHead>口座情報</TableHead>
                  <TableHead>連絡先</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {recipient.recipient_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {recipient.bank_name ? (
                        <div className="text-sm">
                          <div>{recipient.bank_name}</div>
                          {recipient.branch_name && (
                            <div className="text-muted-foreground">{recipient.branch_name}</div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {recipient.account_number ? (
                        <div className="text-sm">
                          <div>{recipient.account_number}</div>
                          {recipient.account_type && (
                            <Badge variant="outline" className="text-xs">
                              {accountTypeLabels[recipient.account_type]}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {recipient.email && <div>{recipient.email}</div>}
                        {recipient.phone && <div className="text-muted-foreground">{recipient.phone}</div>}
                        {!recipient.email && !recipient.phone && "-"}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(recipient.created_at).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/payments/${recipient.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>支払先を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。支払先情報が完全に削除されます。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRecipient(recipient.id)}>削除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecipients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "検索条件に一致する支払先が見つかりません。" : "支払先が登録されていません。"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
