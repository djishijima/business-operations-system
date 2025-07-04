"use client"

import { TaskForm } from "@/components/tasks/task-form"

export default function NewTaskPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">新規タスク作成</h1>
        <p className="text-muted-foreground">新しいタスクを登録します</p>
      </div>
      <TaskForm />
    </div>
  )
}
