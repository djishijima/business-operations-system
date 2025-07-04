"use client"

import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthStatus() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-sm text-muted-foreground">認証状態確認中...</div>
  }

  if (!user) {
    return (
      <Card className="mt-4 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-sm text-yellow-700">認証状態</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">未ログイン</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4 border-green-200">
      <CardHeader>
        <CardTitle className="text-sm text-green-700">認証状態</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">ログイン済み</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          <div>メール: {user.email}</div>
          <div>ID: {user.id}</div>
        </div>
      </CardContent>
    </Card>
  )
}
