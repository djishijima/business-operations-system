"use client"

import { UserForm } from "@/components/users/user-form"

export default function NewUserPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">新規ユーザー作成</h1>
        <p className="text-muted-foreground">新しいユーザーアカウントを作成します</p>
      </div>
      <UserForm />
    </div>
  )
}
