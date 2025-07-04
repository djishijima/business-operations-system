"use client"

import { ApplicationCodeForm } from "@/components/application-codes/application-code-form"

export default function NewApplicationCodePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">新規アプリケーションコード作成</h1>
        <p className="text-muted-foreground">新しいシステムコードを登録します</p>
      </div>
      <ApplicationCodeForm />
    </div>
  )
}
