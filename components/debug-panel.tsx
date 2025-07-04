"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const runDiagnostics = async () => {
    setLoading(true)
    const info: any = {}

    try {
      // 1. Check environment variables
      info.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 設定済み" : "❌ 未設定"
      info.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 設定済み" : "❌ 未設定"

      // 2. Test database connection
      try {
        const { data, error } = await supabase.from("users").select("count").single()
        info.dbConnection = error ? `❌ エラー: ${error.message}` : "✅ 接続成功"
      } catch (e) {
        info.dbConnection = `❌ 接続失敗: ${e}`
      }

      // 3. Check current auth session
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        info.currentSession = session ? "✅ セッション有り" : "❌ セッション無し"
        if (error) info.sessionError = error.message
      } catch (e) {
        info.currentSession = `❌ セッションエラー: ${e}`
      }

      // 4. Test auth signup (without actually creating user)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: "test@test.com",
          password: "invalid",
        })
        info.authService = error?.message.includes("Invalid login credentials") ? "✅ Auth動作中" : "❌ Auth問題"
      } catch (e) {
        info.authService = `❌ Auth接続失敗: ${e}`
      }

      // 5. Check users table
      try {
        const { data, error } = await supabase.from("users").select("*").limit(1)
        info.usersTable = error ? `❌ エラー: ${error.message}` : `✅ 取得成功 (${data?.length || 0}件)`
      } catch (e) {
        info.usersTable = `❌ テーブルエラー: ${e}`
      }

      setDebugInfo(info)
    } catch (error) {
      toast({
        title: "診断エラー",
        description: "診断中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const forceCreateUser = async () => {
    setLoading(true)
    try {
      // Force create admin user
      const { data, error } = await supabase.auth.signUp({
        email: "9999@b-p.co.jp",
        password: "admin",
        options: {
          emailRedirectTo: undefined, // Skip email confirmation
        },
      })

      if (error) {
        toast({
          title: "ユーザー作成エラー",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "成功",
          description: "ユーザーを強制作成しました",
        })

        // Try to insert into users table
        if (data.user) {
          await supabase.from("users").upsert({
            id: data.user.id,
            employee_id: "9999",
            name: "管理者",
            email: "9999@b-p.co.jp",
            role: "admin",
          })
        }
      }
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

  const testDirectLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "9999@b-p.co.jp",
        password: "admin",
      })

      if (error) {
        toast({
          title: "ログインテストエラー",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "ログインテスト成功",
          description: "認証が成功しました！",
        })
        // Redirect to dashboard
        window.location.href = "/leads"
      }
    } catch (error: any) {
      toast({
        title: "ログインテストエラー",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <Card className="mt-4 border-orange-200">
      <CardHeader>
        <CardTitle className="text-sm text-orange-700">システム診断</CardTitle>
        <CardDescription className="text-xs">ログイン問題の診断結果</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div>Supabase URL: {debugInfo.supabaseUrl}</div>
          <div>Supabase Key: {debugInfo.supabaseKey}</div>
          <div>DB接続: {debugInfo.dbConnection}</div>
          <div>現在のセッション: {debugInfo.currentSession}</div>
          <div>Auth サービス: {debugInfo.authService}</div>
          <div>Users テーブル: {debugInfo.usersTable}</div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button onClick={runDiagnostics} disabled={loading} size="sm" variant="outline">
            {loading ? "診断中..." : "再診断"}
          </Button>
          <Button onClick={forceCreateUser} disabled={loading} size="sm" className="bg-orange-600 hover:bg-orange-700">
            強制ユーザー作成
          </Button>
          <Button onClick={testDirectLogin} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700">
            直接ログインテスト
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
