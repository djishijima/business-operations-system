"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // 未認証の場合はログインページにリダイレクト
        router.push("/login")
        return
      }

      if (user.role !== "admin") {
        // 管理者権限がない場合はフォールバック表示
        setShowFallback(true)
        return
      }

      setShowFallback(false)
    }
  }, [user, loading, router])

  // ローディング中
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 未認証（リダイレクト処理中）
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">認証を確認しています...</p>
        </div>
      </div>
    )
  }

  // 管理者権限なし
  if (showFallback) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">アクセス拒否</CardTitle>
            <CardDescription>この機能にアクセスするには管理者権限が必要です。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>現在のユーザー: {user.name}</p>
              <p>権限レベル: {user.role === "admin" ? "管理者" : "一般ユーザー"}</p>
              <p>従業員ID: {user.employee_id}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              <Button onClick={() => router.push("/")} className="flex-1">
                ダッシュボード
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 管理者権限あり - 子コンポーネントを表示
  return <>{children}</>
}
