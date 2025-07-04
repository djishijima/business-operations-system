"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type ApplicationCode = Database["public"]["Tables"]["application_codes"]["Row"]

const formSchema = z.object({
  code: z.string().min(1, "コードは必須です").max(50, "コードは50文字以内で入力してください"),
  label: z.string().min(1, "ラベルは必須です").max(100, "ラベルは100文字以内で入力してください"),
  category: z.string().min(1, "カテゴリは必須です"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

interface ApplicationCodeFormProps {
  applicationCode?: ApplicationCode
  onSuccess?: () => void
}

const categoryOptions = [
  { value: "expense_category", label: "経費カテゴリ" },
  { value: "task_type", label: "タスク種別" },
  { value: "approval_type", label: "承認種別" },
  { value: "document_type", label: "文書種別" },
  { value: "priority_level", label: "優先度レベル" },
  { value: "status_type", label: "ステータス種別" },
  { value: "department", label: "部署" },
  { value: "other", label: "その他" },
]

export function ApplicationCodeForm({ applicationCode, onSuccess }: ApplicationCodeFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: applicationCode?.code || "",
      label: applicationCode?.label || "",
      category: applicationCode?.category || "",
      description: applicationCode?.description || "",
      is_active: applicationCode?.is_active ?? true,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    try {
      const codeData = {
        ...values,
        description: values.description || null,
      }

      if (applicationCode) {
        const { error } = await supabase.from("application_codes").update(codeData).eq("id", applicationCode.id)
        if (error) throw error
        toast({ title: "成功", description: "アプリケーションコードを更新しました。" })
      } else {
        const { error } = await supabase.from("application_codes").insert([codeData])
        if (error) throw error
        toast({ title: "成功", description: "アプリケーションコードを作成しました。" })
      }

      onSuccess?.()
      router.push("/codes")
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message || "操作に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{applicationCode ? "アプリケーションコード編集" : "新規アプリケーションコード作成"}</CardTitle>
        <CardDescription>システムで使用するコード情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>コード *</FormLabel>
                    <FormControl>
                      <Input placeholder="EXP_TRAVEL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ラベル *</FormLabel>
                    <FormControl>
                      <Input placeholder="出張費" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">有効状態</FormLabel>
                      <div className="text-sm text-muted-foreground">このコードを使用可能にします</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea placeholder="コードの詳細な説明を入力してください" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : applicationCode ? "更新" : "作成"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/codes")}>
                キャンセル
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
