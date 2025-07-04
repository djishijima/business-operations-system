"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { UserForm } from "@/components/users/user-form"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]

export default function EditUserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", params.id).single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "ユーザーの取得に失敗しました。",
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

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">ユーザーが見つかりません。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ユーザー編集</h1>
        <p className="text-muted-foreground">ユーザー情報を編集します</p>
      </div>
      <UserForm user={user} />
    </div>
  )
}
