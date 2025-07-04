"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Lead = Database["public"]["Tables"]["leads"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

const formSchema = z.object({
  name: z.string().min(1, "担当者名は必須です"),
  company_name: z.string().min(1, "会社名は必須です"),
  status: z.enum(["new", "contacted", "qualified", "lost"]),
  contact_email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
})

interface LeadFormProps {
  lead?: Lead
  onSuccess?: () => void
}

export function LeadForm({ lead, onSuccess }: LeadFormProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company_name: "",
      status: "new",
      contact_email: "",
      contact_phone: "",
      notes: "",
      assigned_to: "unassigned", // Updated default value to be a non-empty string
    },
  })

  useEffect(() => {
    fetchUsers()
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name || "",
        company_name: lead.company_name || "",
        status: lead.status || "new",
        contact_email: lead.contact_email || "",
        contact_phone: lead.contact_phone || "",
        notes: lead.notes || "",
        assigned_to: lead.assigned_to || "unassigned", // Updated default value to be a non-empty string
      })
    }
  }, [lead, form])

  const getCurrentUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userData } = await supabase.from("users").select("*").eq("email", session.user.email).single()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error("Failed to get current user:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("status", "active").order("name")

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "エラー",
        description: "ユーザー一覧の取得に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast({
        title: "エラー",
        description: "ユーザー情報が取得できません。ログインし直してください。",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const leadData = {
        name: values.name,
        company_name: values.company_name,
        status: values.status,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        notes: values.notes || null,
        assigned_to: values.assigned_to || "unassigned", // Updated default value to be a non-empty string
        updated_at: new Date().toISOString(),
      }

      if (lead) {
        // 更新処理
        const { error } = await supabase.from("leads").update(leadData).eq("id", lead.id)

        if (error) throw error

        toast({
          title: "成功",
          description: "リードを更新しました。",
        })
      } else {
        // 新規作成処理
        const { error } = await supabase.from("leads").insert([
          {
            ...leadData,
            created_at: new Date().toISOString(),
          },
        ])

        if (error) throw error

        toast({
          title: "成功",
          description: "リードを作成しました。",
        })
      }

      onSuccess?.()
      router.push("/leads")
    } catch (error: any) {
      console.error("Lead submission error:", error)
      toast({
        title: "エラー",
        description: error.message || "操作に失敗しました。詳細をコンソールで確認してください。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{lead ? "リード編集" : "新規リード作成"}</CardTitle>
        <CardDescription>リード情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>担当者名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="山田太郎" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>会社名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="株式会社サンプル" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ステータス</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ステータスを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">新規</SelectItem>
                        <SelectItem value="contacted">連絡済み</SelectItem>
                        <SelectItem value="qualified">見込み</SelectItem>
                        <SelectItem value="lost">失注</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>担当者</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="担当者を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">未割り当て</SelectItem>{" "}
                        {/* Updated value prop to be a non-empty string */}
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.employee_id})
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
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input placeholder="03-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備考</FormLabel>
                  <FormControl>
                    <Textarea placeholder="備考を入力してください" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : lead ? "更新" : "作成"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/leads")}>
                キャンセル
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
