"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Copy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { TemplateEngine } from "@/lib/template-engine"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import type { Database } from "@/lib/database.types"

type ModuleTemplate = Database["public"]["Tables"]["module_templates"]["Row"]

const moduleOptions = [
  { value: "leads", label: "リード" },
  { value: "tasks", label: "タスク" },
  { value: "approvals", label: "承認申請" },
  { value: "users", label: "ユーザー" },
  { value: "payment_recipients", label: "支払先" },
  { value: "application_codes", label: "アプリケーションコード" },
  { value: "nextcloud_files", label: "ファイル" },
]

const templateTypeOptions = [
  { value: "ai_prompt", label: "AIプロンプト", color: "bg-purple-100 text-purple-800" },
  { value: "slack", label: "Slack通知", color: "bg-green-100 text-green-800" },
  { value: "email", label: "メール", color: "bg-blue-100 text-blue-800" },
  { value: "sms", label: "SMS", color: "bg-yellow-100 text-yellow-800" },
  { value: "pdf", label: "PDF", color: "bg-red-100 text-red-800" },
  { value: "custom", label: "カスタム", color: "bg-gray-100 text-gray-800" },
]

export function TemplateManager() {
  const [templates, setTemplates] = useState<ModuleTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [editingTemplate, setEditingTemplate] = useState<ModuleTemplate | null>(null)
  const [previewData, setPreviewData] = useState<any>({})
  const [previewResult, setPreviewResult] = useState<string>("")
  const [availableVariables, setAvailableVariables] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("module_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "テンプレートの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from("module_templates").delete().eq("id", id)
      if (error) throw error
      toast({ title: "成功", description: "テンプレートを削除しました。" })
      fetchTemplates()
    } catch (error) {
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const previewTemplate = async (template: ModuleTemplate) => {
    try {
      const variables = await TemplateEngine.getAvailableVariables(template.module_name)
      setAvailableVariables(variables)

      // サンプルデータを生成
      const sampleData: any = {}
      variables.forEach((variable) => {
        switch (variable) {
          case "name":
          case "contact_name":
            sampleData[variable] = "山田太郎"
            break
          case "company_name":
            sampleData[variable] = "株式会社サンプル"
            break
          case "email":
          case "contact_email":
            sampleData[variable] = "yamada@example.com"
            break
          case "phone":
          case "contact_phone":
            sampleData[variable] = "03-1234-5678"
            break
          case "title":
            sampleData[variable] = "サンプルタスク"
            break
          case "status":
            sampleData[variable] = "進行中"
            break
          case "priority":
            sampleData[variable] = "高"
            break
          case "amount":
            sampleData[variable] = "50000"
            break
          case "due_date":
          case "date":
            sampleData[variable] = "2025-07-15"
            break
          default:
            sampleData[variable] = `サンプル${variable}`
        }
      })

      setPreviewData(sampleData)
      const result = TemplateEngine.expandTemplate(template.content, sampleData)
      setPreviewResult(result)
    } catch (error) {
      toast({
        title: "エラー",
        description: "プレビューの生成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "コピー完了", description: "テンプレートをクリップボードにコピーしました。" })
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === "all" || template.module_name === selectedModule
    const matchesType = selectedType === "all" || template.template_type === selectedType

    return matchesSearch && matchesModule && matchesType
  })

  const getTypeColor = (type: string) => {
    const option = templateTypeOptions.find((opt) => opt.value === type)
    return option?.color || "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">テンプレート管理</h2>
          <p className="text-muted-foreground">AI・通知・メール用のテンプレートを管理します</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規テンプレート
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>新規テンプレート作成</DialogTitle>
              <DialogDescription>新しいテンプレートを作成します</DialogDescription>
            </DialogHeader>
            {/* テンプレート作成フォーム */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">テンプレート作成機能は実装中です。</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>検索</Label>
              <Input
                placeholder="テンプレート名・内容で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>モジュール</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="モジュールを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのモジュール</SelectItem>
                  {moduleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>タイプ</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのタイプ</SelectItem>
                  {templateTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* テンプレート一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>テンプレート一覧 ({filteredTemplates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>モジュール</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      {moduleOptions.find((opt) => opt.value === template.module_name)?.label || template.module_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(template.template_type)}>
                        {templateTypeOptions.find((opt) => opt.value === template.template_type)?.label ||
                          template.template_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{template.description}</TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "有効" : "無効"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => previewTemplate(template)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>テンプレートプレビュー</DialogTitle>
                              <DialogDescription>
                                {template.name} - {template.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>テンプレート内容</Label>
                                <Textarea
                                  value={template.content}
                                  readOnly
                                  className="min-h-[200px] font-mono text-sm"
                                />
                                <div className="mt-2">
                                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(template.content)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    コピー
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label>プレビュー結果</Label>
                                <Textarea value={previewResult} readOnly className="min-h-[200px]" />
                                <div className="mt-2 text-xs text-muted-foreground">
                                  使用可能な変数: {availableVariables.map((v) => `{{${v}}}`).join(", ")}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>テンプレートを削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。テンプレート "{template.name}" が完全に削除されます。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTemplate(template.id)}>削除</AlertDialogAction>
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

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || selectedModule !== "all" || selectedType !== "all"
                  ? "検索条件に一致するテンプレートが見つかりません。"
                  : "テンプレートが登録されていません。"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
