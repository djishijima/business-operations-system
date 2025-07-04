"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Trash2, Tag, ToggleLeft, ToggleRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

type ApplicationCode = Database["public"]["Tables"]["application_codes"]["Row"]

const categoryColors = {
  expense_category: "bg-blue-100 text-blue-800",
  task_type: "bg-green-100 text-green-800",
  approval_type: "bg-purple-100 text-purple-800",
  document_type: "bg-orange-100 text-orange-800",
  priority_level: "bg-red-100 text-red-800",
  status_type: "bg-yellow-100 text-yellow-800",
  department: "bg-cyan-100 text-cyan-800",
  other: "bg-gray-100 text-gray-800",
}

const categoryLabels = {
  expense_category: "経費カテゴリ",
  task_type: "タスク種別",
  approval_type: "承認種別",
  document_type: "文書種別",
  priority_level: "優先度レベル",
  status_type: "ステータス種別",
  department: "部署",
  other: "その他",
}

export default function ApplicationCodesPage() {
  const [codes, setCodes] = useState<ApplicationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showInactiveOnly, setShowInactiveOnly] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("application_codes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "アプリケーションコードの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("application_codes").update({ is_active: !currentStatus }).eq("id", id)

      if (error) throw error
      toast({
        title: "成功",
        description: `コードを${!currentStatus ? "有効" : "無効"}にしました。`,
      })
      fetchCodes()
    } catch (error) {
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const deleteCode = async (id: string) => {
    try {
      const { error } = await supabase.from("application_codes").delete().eq("id", id)
      if (error) throw error
      toast({ title: "成功", description: "アプリケーションコードを削除しました。" })
      fetchCodes()
    } catch (error) {
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const filteredCodes = codes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.description && code.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || code.category === selectedCategory
    const matchesActiveFilter = showInactiveOnly ? !code.is_active : true

    return matchesSearch && matchesCategory && matchesActiveFilter
  })

  const categories = Array.from(new Set(codes.map((code) => code.category)))

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
          <h1 className="text-3xl font-bold">アプリケーションコード</h1>
          <p className="text-muted-foreground">システムで使用するコード体系を管理します</p>
        </div>
        <Button asChild>
          <Link href="/codes/new">
            <Plus className="h-4 w-4 mr-2" />
            新規コード追加
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>コード一覧</CardTitle>
          <CardDescription>登録されているアプリケーションコードの一覧です</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="コード、ラベル、説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="カテゴリで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showInactiveOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowInactiveOnly(!showInactiveOnly)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showInactiveOnly ? "無効のみ" : "すべて"}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>コード</TableHead>
                  <TableHead>ラベル</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-medium">{code.code}</TableCell>
                    <TableCell className="font-medium">{code.label}</TableCell>
                    <TableCell>
                      <Badge className={categoryColors[code.category as keyof typeof categoryColors]}>
                        <Tag className="h-3 w-3 mr-1" />
                        {categoryLabels[code.category as keyof typeof categoryLabels] || code.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{code.description || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActiveStatus(code.id, code.is_active || false)}
                        className="h-8 w-8 p-0"
                      >
                        {code.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{new Date(code.created_at).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/codes/${code.id}/edit`}>
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
                              <AlertDialogTitle>コードを削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。アプリケーションコードが完全に削除されます。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCode(code.id)}>削除</AlertDialogAction>
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

          {filteredCodes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" || showInactiveOnly
                  ? "検索条件に一致するコードが見つかりません。"
                  : "アプリケーションコードが登録されていません。"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
