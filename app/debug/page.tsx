"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [info, setInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkEverything()
  }, [])

  const checkEverything = async () => {
    const debugInfo: any = {}

    // Environment variables
    debugInfo.env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "未設定",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "設定済み" : "未設定",
    }

    // Database connection
    try {
      const { data, error } = await supabase.from("users").select("*")
      debugInfo.database = {
        status: error ? "エラー" : "成功",
        error: error?.message,
        userCount: data?.length || 0,
        users: data || [],
      }
    } catch (e) {
      debugInfo.database = { status: "接続失敗", error: String(e) }
    }

    // Auth status
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      debugInfo.auth = {
        hasSession: !!session,
        user: session?.user || null,
      }
    } catch (e) {
      debugInfo.auth = { error: String(e) }
    }

    // Auth users (admin only)
    try {
      const { data, error } = await supabase.auth.admin.listUsers()
      debugInfo.authUsers = {
        status: error ? "エラー" : "成功",
        error: error?.message,
        count: data?.users?.length || 0,
        users: data?.users || [],
      }
    } catch (e) {
      debugInfo.authUsers = { status: "権限なし", error: String(e) }
    }

    setInfo(debugInfo)
    setLoading(false)
  }

  const createTestUser = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: "9999@b-p.co.jp",
        password: "admin",
      })

      if (error) {
        alert(`エラー: ${error.message}`)
      } else {
        alert("ユーザー作成成功！")
        checkEverything()
      }
    } catch (e) {
      alert(`エラー: ${e}`)
    }
  }

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "9999@b-p.co.jp",
        password: "admin",
      })

      if (error) {
        alert(`ログインエラー: ${error.message}`)
      } else {
        alert("ログイン成功！")
        window.location.href = "/leads"
      }
    } catch (e) {
      alert(`エラー: ${e}`)
    }
  }

  if (loading) {
    return <div className="p-6">読み込み中...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">システム診断</h1>

      <Card>
        <CardHeader>
          <CardTitle>環境変数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Supabase URL: {info.env?.supabaseUrl}</div>
            <div>Supabase Key: {info.env?.supabaseKey}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>データベース接続</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              ステータス:{" "}
              <Badge variant={info.database?.status === "成功" ? "default" : "destructive"}>
                {info.database?.status}
              </Badge>
            </div>
            {info.database?.error && <div className="text-red-600">エラー: {info.database.error}</div>}
            <div>ユーザー数: {info.database?.userCount}</div>
            {info.database?.users?.length > 0 && (
              <div>
                <h4 className="font-semibold">ユーザー一覧:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(info.database.users, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>認証状態</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              セッション:{" "}
              <Badge variant={info.auth?.hasSession ? "default" : "secondary"}>
                {info.auth?.hasSession ? "有り" : "無し"}
              </Badge>
            </div>
            {info.auth?.user && (
              <div>
                <h4 className="font-semibold">現在のユーザー:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(info.auth.user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>テスト機能</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={createTestUser} className="mr-2">
            テストユーザー作成
          </Button>
          <Button onClick={testLogin} variant="outline" className="mr-2 bg-transparent">
            ログインテスト
          </Button>
          <Button onClick={checkEverything} variant="outline">
            再診断
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
