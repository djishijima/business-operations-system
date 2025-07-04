"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Zap } from "lucide-react"

export default function OcrComposerPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>OCR・自動組版システムを利用するにはログインが必要です。</AlertDescription>
      </Alert>
    )
  }

  const ocrComposerUrl = process.env.NEXT_PUBLIC_OCR_COMPOSER_URL || "https://aistudio.google.com"

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">OCR・自動組版システム</h1>
              <p className="text-gray-600 mt-2">Google AI Studio連携による高精度OCR処理と自動組版</p>
            </div>
          </div>
          <a
            href={ocrComposerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm">新しいタブで開く</span>
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ユーザー情報</CardTitle>
            <CardDescription>現在ログイン中のユーザー</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>名前:</strong> {user.name}
              </p>
              <p>
                <strong>メール:</strong> {user.email}
              </p>
              <p>
                <strong>権限:</strong> {user.role === "admin" ? "管理者" : "一般ユーザー"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="border rounded-lg overflow-hidden" style={{ height: "800px" }}>
          <iframe
            src={ocrComposerUrl}
            className="w-full h-full border-0"
            title="OCR・自動組版システム"
            allow="clipboard-read; clipboard-write; microphone; camera"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        <Alert>
          <AlertDescription>
            <strong>注意:</strong> このシステムはGoogle AI Studioと連携しています。
            処理されたデータは適切なセキュリティ対策の下で管理されますが、
            機密性の高い文書の処理には十分ご注意ください。
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
