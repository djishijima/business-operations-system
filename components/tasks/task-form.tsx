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

type Task = Database["public"]["Tables"]["tasks"]["Row"]
type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"]

const formSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  status: z.enum(["todo", "in_progress", "done"]),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  report_id: z.string().optional(),
})

interface TaskFormProps {
  task?: Task
  onSuccess?: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<DailyReport[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      status: task?.status || "todo",
      due_date: task?.due_date || "",
      notes: task?.notes || "",
      report_id: task?.report_id || "none", // Updated default value to be a non-empty string
    },
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const { data } = await supabase
      .from("daily_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(50)
    setReports(data || [])
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    try {
      const taskData = {
        ...values,
        due_date: values.due_date || null,
        notes: values.notes || null,
        report_id: values.report_id || null,
      }

      if (task) {
        const { error } = await supabase.from("tasks").update(taskData).eq("id", task.id)
        if (error) throw error
        toast({ title: "成功", description: "タスクを更新しました。" })
      } else {
        const { error } = await supabase.from("tasks").insert([taskData])
        if (error) throw error
        toast({ title: "成功", description: "タスクを作成しました。" })
      }

      onSuccess?.()
      router.push("/tasks")
    } catch (error) {
      toast({
        title: "エラー",
        description: "操作に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? "タスク編集" : "新規タスク作成"}</CardTitle>
        <CardDescription>タスク情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タスク名 *</FormLabel>
                  <FormControl>
                    <Input placeholder="タスク名を入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ステータス</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ステータスを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">未着手</SelectItem>
                        <SelectItem value="in_progress">進行中</SelectItem>
                        <SelectItem value="done">完了</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>期限日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="report_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>関連日報</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="日報を選択（任意）" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">関連なし</SelectItem> {/* Updated value to be a non-empty string */}
                      {reports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.report_date} - {report.summary?.substring(0, 30)}...
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
                {loading ? "保存中..." : task ? "更新" : "作成"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/tasks")}>
                キャンセル
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
