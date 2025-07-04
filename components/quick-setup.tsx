"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export function QuickSetup() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loginAsAdmin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@b-p.co.jp", // 正しいメールアドレス
        password: "admin",
      })

      if (error) throw error

      toast({
        title: "成功",
        description: "管理者としてログインしました！",
      })
      window.location.href = "/leads"
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loginAsUser = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "user@b-p.co.jp", // 正しいメールアドレス
        password: "user",
      })

      if (error) throw error

      toast({
        title: "成功",
        description: "ユーザーとしてログインしました！",
      })
      window.location.href = "/leads"
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const syncUserData = async () => {
    setLoading(true)
    try {
      // Update public.users table to match auth emails
      const { error: updateError } = await supabase
        .from("users")
        .update({ email: "admin@b-p.co.jp" })
        .eq("employee_id", "9999")

      if (updateError) throw updateError

      const { error: updateError2 } = await supabase
        .from("users")
        .update({ email: "user@b-p.co.jp" })
        .eq("employee_id", "0")

      if (updateError2) throw updateError2

      toast({
        title: "成功",
        description: "ユーザーデータを同期しました！",
      })
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4 border-green-200">
      <CardHeader>
        <CardTitle className="text-sm text-green-700">クイックログイン</CardTitle>
        <CardDescription className="text-xs">既存のアカウントでログイン</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={syncUserData} disabled={loading} size="sm" className="w-full bg-transparent" variant="outline">
          {loading ? "同期中..." : "ユーザーデータ同期"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={loginAsAdmin} disabled={loading} size="sm" className="bg-red-600 hover:bg-red-700">
            管理者ログイン
          </Button>
          <Button onClick={loginAsUser} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700">
            ユーザーログイン
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
