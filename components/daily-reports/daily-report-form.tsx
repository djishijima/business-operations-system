"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface DailyReportFormProps {
  mode: "create" | "edit"
  initialData?: {
    id?: string
    title: string
    content: string
    date: string
    project_id: string | null
  }
}

export function DailyReportForm({ mode, initialData }: DailyReportFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0])
  const [projectId, setProjectId] = useState(initialData?.project_id || "none")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("status", "active").order("name")

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("プロジェクトの取得に失敗:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "エラー",
        description: "ログインが必要です。",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "エラー",
        description: "タイトルと内容を入力してください。",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const reportData = {
        title: title.trim(),
        content: content.trim(),
        date,
        user_id: user.id,
        project_id: projectId === "none" ? null : projectId,
        updated_at: new Date().toISOString(),
      }

      if (mode === "create") {
        const { error } = await supabase.from("daily_reports").insert([reportData])

        if (error) throw error

        toast({
          title: "成功",
          description: "日報を作成しました。",
        })
      } else {
        const { error } = await supabase.from("daily_reports").update(reportData).eq("id", initialData?.id)

        if (error) throw error

        toast({
          title: "成功",
          description: "日報を更新しました。",
        })
      }

      router.push("/daily-reports")
    } catch (error) {
      toast({
        title: "エラー",
        description: mode === "create" ? "日報の作成に失敗しました。" : "日報の更新に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="日報のタイトルを入力"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">日付</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project">プロジェクト（任意）</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger>
            <SelectValue placeholder="プロジェクトを選択（任意）" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">選択なし</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日の業務内容、進捗、課題などを記入してください..."
          rows={10}
          required
        />
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : mode === "create" ? "日報作成" : "日報更新"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
