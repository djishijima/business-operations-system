"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export function DevLogin() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const createTestUser = async () => {
    setLoading(true)
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: "o@b-p.co.jp",
        password: "password123",
      })

      if (error) {
        toast({
          title: "エラー",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "成功",
          description: "テストユーザーを作成しました。確認メールをチェックしてください。",
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "ユーザー作成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">開発者向け</CardTitle>
        <CardDescription className="text-xs">テスト用ユーザーの作成</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={createTestUser} disabled={loading} size="sm" variant="outline">
          {loading ? "作成中..." : "テストユーザー作成"}
        </Button>
      </CardContent>
    </Card>
  )
}
