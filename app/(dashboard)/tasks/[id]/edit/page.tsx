"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TaskForm } from "@/components/tasks/task-form"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

export default function EditTaskPage() {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchTask()
  }, [])

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("*").eq("id", params.id).single()

      if (error) throw error
      setTask(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "タスクの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">タスクが見つかりません。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">タスク編集</h1>
        <p className="text-muted-foreground">タスク情報を編集します</p>
      </div>
      <TaskForm task={task} />
    </div>
  )
}
