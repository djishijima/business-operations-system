"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw, Bug, Database, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { SystemVerificationService } from "@/lib/verification-service"

interface VerificationResult {
  module: string
  test: string
  status: "pass" | "fail" | "warning" | "pending"
  message: string
  details?: any
  timestamp: Date
}

interface ModuleStatus {
  name: string
  label: string
  tests: number
  passed: number
  failed: number
  warnings: number
  status: "complete" | "running" | "pending" | "error"
}

export default function VerificationPage() {
  const [results, setResults] = useState<VerificationResult[]>([])
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([])
  const [currentTest, setCurrentTest] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const modules = [
    { name: "approvals", label: "承認申請", icon: "📝" },
    { name: "leads", label: "リード管理", icon: "🎯" },
    { name: "tasks", label: "タスク・日報", icon: "📋" },
    { name: "users", label: "ユーザー管理", icon: "👤" },
    { name: "payments", label: "支払先管理", icon: "💰" },
    { name: "codes", label: "アプリケーションコード", icon: "🏷️" },
    { name: "templates", label: "テンプレート管理", icon: "📄" },
  ]

  useEffect(() => {
    initializeModuleStatuses()
  }, [])

  const initializeModuleStatuses = () => {
    const statuses: ModuleStatus[] = modules.map((module) => ({
      name: module.name,
      label: module.label,
      tests: getTestCount(module.name),
      passed: 0,
      failed: 0,
      warnings: 0,
      status: "pending",
    }))
    setModuleStatuses(statuses)
  }

  const getTestCount = (moduleName: string): number => {
    const testCounts: { [key: string]: number } = {
      approvals: 8, // カテゴリ選択、動的フォーム、ステータス遷移、AI出力、PDF出力、通知、DB保存、バリデーション
      leads: 7, // CRUD、担当者割当、ステータス遷移、Slack通知、AI要約、検索、RLS
      tasks: 6, // 日報作成、タスク追加、ステータス変更、変数展開、AI提案、関連付け
      users: 5, // CRUD、権限管理、認証、プロファイル、RLS
      payments: 4, // CRUD、銀行情報、バリデーション、検索
      codes: 4, // CRUD、カテゴリ管理、有効/無効、検索
      templates: 5, // テンプレート管理、変数展開、AI連携、プレビュー、適用
    }
    return testCounts[moduleName] || 5
  }

  const runAllVerifications = async () => {
    setIsRunning(true)
    setResults([])
    setProgress(0)

    const totalTests = moduleStatuses.reduce((sum, module) => sum + module.tests, 0)
    let completedTests = 0

    for (const module of modules) {
      setCurrentTest(`${module.label}の検証中...`)

      // モジュールステータス更新
      setModuleStatuses((prev) => prev.map((m) => (m.name === module.name ? { ...m, status: "running" } : m)))

      try {
        const moduleResults = await SystemVerificationService.verifyModule(module.name)

        // 結果を追加
        setResults((prev) => [...prev, ...moduleResults])

        // ステータス集計
        const passed = moduleResults.filter((r) => r.status === "pass").length
        const failed = moduleResults.filter((r) => r.status === "fail").length
        const warnings = moduleResults.filter((r) => r.status === "warning").length

        setModuleStatuses((prev) =>
          prev.map((m) =>
            m.name === module.name
              ? {
                  ...m,
                  passed,
                  failed,
                  warnings,
                  status: failed > 0 ? "error" : "complete",
                }
              : m,
          ),
        )

        completedTests += moduleResults.length
        setProgress((completedTests / totalTests) * 100)

        // 少し待機（UI更新のため）
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Verification failed for ${module.name}:`, error)

        setModuleStatuses((prev) => prev.map((m) => (m.name === module.name ? { ...m, status: "error" } : m)))
      }
    }

    setCurrentTest("")
    setIsRunning(false)
    setProgress(100)

    const totalPassed = results.filter((r) => r.status === "pass").length
    const totalFailed = results.filter((r) => r.status === "fail").length

    toast({
      title: "検証完了",
      description: `${totalPassed}件成功、${totalFailed}件失敗`,
      variant: totalFailed > 0 ? "destructive" : "default",
    })
  }

  const runModuleVerification = async (moduleName: string) => {
    setIsRunning(true)
    setCurrentTest(`${modules.find((m) => m.name === moduleName)?.label}の検証中...`)

    try {
      const moduleResults = await SystemVerificationService.verifyModule(moduleName)

      // 既存の結果から該当モジュールを削除して新しい結果を追加
      setResults((prev) => [...prev.filter((r) => r.module !== moduleName), ...moduleResults])

      const passed = moduleResults.filter((r) => r.status === "pass").length
      const failed = moduleResults.filter((r) => r.status === "fail").length
      const warnings = moduleResults.filter((r) => r.status === "warning").length

      setModuleStatuses((prev) =>
        prev.map((m) =>
          m.name === moduleName
            ? {
                ...m,
                passed,
                failed,
                warnings,
                status: failed > 0 ? "error" : "complete",
              }
            : m,
        ),
      )

      toast({
        title: "モジュール検証完了",
        description: `${passed}件成功、${failed}件失敗、${warnings}件警告`,
      })
    } catch (error) {
      toast({
        title: "検証エラー",
        description: `${moduleName}の検証中にエラーが発生しました`,
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
      setCurrentTest("")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />
    }
  }

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">☠️ HellBuild Phase 5 検証UI</h1>
          <p className="text-muted-foreground">システム機能実装完了チェック＋エラー検証</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllVerifications} disabled={isRunning} size="lg">
            {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "検証実行中..." : "全モジュール検証"}
          </Button>
        </div>
      </div>

      {/* 進行状況 */}
      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentTest}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="modules">モジュール別</TabsTrigger>
          <TabsTrigger value="results">詳細結果</TabsTrigger>
          <TabsTrigger value="errors">エラー分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* 実装完了チェックリスト */}
          <Card>
            <CardHeader>
              <CardTitle>✅ システム実装完了チェックリスト</CardTitle>
              <CardDescription>各モジュールの実装状況を確認</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleStatuses.map((module) => (
                  <Card key={module.name} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{modules.find((m) => m.name === module.name)?.icon}</span>
                          <span className="font-medium">{module.label}</span>
                        </div>
                        <Badge className={getModuleStatusColor(module.status)}>
                          {module.status === "complete"
                            ? "完了"
                            : module.status === "running"
                              ? "実行中"
                              : module.status === "error"
                                ? "エラー"
                                : "待機中"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>テスト数:</span>
                          <span>{module.tests}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>成功:</span>
                          <span>{module.passed}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>失敗:</span>
                          <span>{module.failed}</span>
                        </div>
                        <div className="flex justify-between text-yellow-600">
                          <span>警告:</span>
                          <span>{module.warnings}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 bg-transparent"
                        onClick={() => runModuleVerification(module.name)}
                        disabled={isRunning}
                      >
                        個別検証
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">成功</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {results.filter((r) => r.status === "pass").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">失敗</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {results.filter((r) => r.status === "fail").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">警告</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter((r) => r.status === "warning").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">総テスト</span>
                </div>
                <div className="text-2xl font-bold">{results.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          {modules.map((module) => {
            const moduleResults = results.filter((r) => r.module === module.name)
            const moduleStatus = moduleStatuses.find((m) => m.name === module.name)

            return (
              <Card key={module.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">{module.icon}</span>
                    {module.label}
                    <Badge className={getModuleStatusColor(moduleStatus?.status || "pending")}>
                      {moduleStatus?.passed || 0}/{moduleStatus?.tests || 0}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {module.name === "approvals" && "カテゴリ選択・動的フォーム・ステータス遷移・AI出力・PDF出力"}
                    {module.name === "leads" && "CRUD・担当者割当・ステータス遷移・Slack通知・AI要約"}
                    {module.name === "tasks" && "日報作成・タスク追加・ステータス変更・変数展開・AI提案"}
                    {module.name === "users" && "CRUD・権限管理・認証・プロファイル・RLS"}
                    {module.name === "payments" && "CRUD・銀行情報・バリデーション・検索"}
                    {module.name === "codes" && "CRUD・カテゴリ管理・有効/無効・検索"}
                    {module.name === "templates" && "テンプレート管理・変数展開・AI連携・プレビュー"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {moduleResults.length > 0 ? (
                      moduleResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm">{result.test}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{result.timestamp.toLocaleTimeString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Bug className="h-8 w-8 mx-auto mb-2" />
                        <p>検証未実行</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>詳細検証結果</CardTitle>
              <CardDescription>全ての検証結果を時系列で表示</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  results
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((result, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{result.module}</Badge>
                            <span className="font-medium">{result.test}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.details && (
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{result.timestamp.toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4" />
                    <p>検証を実行してください</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>エラー分析</CardTitle>
              <CardDescription>失敗したテストの詳細分析</CardDescription>
            </CardHeader>
            <CardContent>
              {results.filter((r) => r.status === "fail").length > 0 ? (
                <div className="space-y-4">
                  {results
                    .filter((r) => r.status === "fail")
                    .map((result, index) => (
                      <Alert key={index} variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>
                          {result.module} - {result.test}
                        </AlertTitle>
                        <AlertDescription>
                          <p>{result.message}</p>
                          {result.details && (
                            <details className="mt-2">
                              <summary className="cursor-pointer">詳細情報</summary>
                              <pre className="text-xs bg-red-50 p-2 rounded mt-2 overflow-x-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>エラーはありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
