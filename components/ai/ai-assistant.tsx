"use client"

import { useState } from "react"
import { Wand2, Loader2, Copy, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { TemplateEngine } from "@/lib/template-engine"

interface AiAssistantProps {
  moduleName: string
  data: any
  onResult?: (result: string) => void
}

export function AiAssistant({ moduleName, data, onResult }: AiAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")
  const [promptType, setPromptType] = useState<"summary" | "analysis" | "suggestion">("summary")
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const { toast } = useToast()

  const generateAiContent = async () => {
    setLoading(true)
    try {
      let prompt: string

      if (customPrompt.trim()) {
        // カスタムプロンプトの場合は変数展開
        prompt = TemplateEngine.expandTemplate(customPrompt, data)
      } else {
        // 定型プロンプトの場合
        prompt = await TemplateEngine.generateAiPrompt(moduleName, data, promptType)
      }

      // 実際のAI API呼び出し（ここではシミュレーション）
      // const response = await fetch('/api/ai/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt })
      // })
      // const aiResult = await response.json()

      // シミュレーション結果
      const simulatedResult = generateSimulatedResponse(prompt, promptType)

      setResult(simulatedResult)
      onResult?.(simulatedResult)

      toast({
        title: "AI生成完了",
        description: "コンテンツを生成しました。",
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "AI生成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSimulatedResponse = (prompt: string, type: string): string => {
    const responses = {
      summary: `【要約】\n${prompt.split("\n").slice(1).join("\n")}\n\n上記の情報をまとめると、重要なポイントは以下の通りです：\n• 現在の状況と進捗\n• 注意すべき事項\n• 次のアクション`,
      analysis: `【分析結果】\n提供された情報を分析した結果：\n\n✅ 良好な点：\n• 情報が適切に整理されている\n• 必要な項目が記載されている\n\n⚠️ 改善点：\n• より詳細な情報があると良い\n• 期限の明確化が必要\n\n💡 提案：\n• 定期的な進捗確認\n• 関係者との連携強化`,
      suggestion: `【次のアクション提案】\n現在の状況に基づく推奨アクション：\n\n🎯 優先度：高\n• 即座に対応が必要な項目\n• 関係者への連絡\n\n📋 優先度：中\n• 計画的に進める項目\n• 資料の準備\n\n📝 優先度：低\n• 長期的な改善項目\n• 効率化の検討`,
    }

    return responses[type as keyof typeof responses] || responses.summary
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    toast({ title: "コピー完了", description: "結果をクリップボードにコピーしました。" })
  }

  const downloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-result-${moduleName}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({ title: "ダウンロード完了", description: "結果をファイルに保存しました。" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI アシスタント
        </CardTitle>
        <CardDescription>AIを使用してコンテンツを自動生成します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">生成タイプ</label>
            <Select value={promptType} onValueChange={(value: any) => setPromptType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">要約</SelectItem>
                <SelectItem value="analysis">分析</SelectItem>
                <SelectItem value="suggestion">提案</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={generateAiContent} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              {loading ? "生成中..." : "AI生成"}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">カスタムプロンプト（オプション）</label>
          <Textarea
            placeholder="独自のプロンプトを入力（{{field_key}} で変数使用可能）"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            使用可能な変数:{" "}
            {Object.keys(data)
              .map((key) => `{{${key}}}`)
              .join(", ")}
          </div>
        </div>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">生成結果</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyResult}>
                  <Copy className="h-4 w-4 mr-2" />
                  コピー
                </Button>
                <Button variant="outline" size="sm" onClick={downloadResult}>
                  <Download className="h-4 w-4 mr-2" />
                  ダウンロード
                </Button>
              </div>
            </div>
            <Textarea value={result} readOnly className="min-h-[200px] font-mono text-sm" />
            <Badge variant="secondary" className="text-xs">
              {result.length} 文字
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
