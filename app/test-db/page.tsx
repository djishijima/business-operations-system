"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function TestDbPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("テスト中...")
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.from("users").select("*").limit(5)

      if (error) {
        setConnectionStatus(`エラー: ${error.message}`)
      } else {
        setConnectionStatus("接続成功")
        setUsers(data || [])
      }
    } catch (error) {
      setConnectionStatus(`接続エラー: ${error}`)
    }
  }

  const testAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log("Current user:", user)
    } catch (error) {
      console.error("Auth error:", error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>データベース接続テスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>接続状況:</strong> {connectionStatus}
          </div>

          <div>
            <strong>ユーザー数:</strong> {users.length}
          </div>

          <div className="space-x-2">
            <Button onClick={testConnection}>接続テスト</Button>
            <Button onClick={testAuth} variant="outline">
              認証テスト
            </Button>
          </div>

          {users.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">ユーザー一覧:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(users, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
