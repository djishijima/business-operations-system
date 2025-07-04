"use client"

import { useState } from "react"
import { Wand2, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { TemplateEngine } from "@/lib/template-engine"

interface AiAutoFillProps {
  moduleName: string
  currentData: any
  onAutoFill: (filledData: any) => void
  fieldDefinitions: any[]
}

interface AutoFillSuggestion {
  fieldKey: string
  label: string
  suggestedValue: string
  confidence: number
  reasoning: string
}

export function AiAutoFill({ moduleName, currentData, onAutoFill, fieldDefinitions }: AiAutoFillProps) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AutoFillSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { toast } = useToast()

  const generateAutoFill = async () => {
    setLoading(true)
    try {
      // AI対象フィールドを取得
      const aiFields = await TemplateEngine.getAiFields(moduleName)

      // 未入力のフィールドを特定
      const emptyFields = aiFields.filter(
        (field) => !currentData[field.field_key] || currentData[field.field_key] === "",
      )

      if (emptyFields.length === 0) {
        toast({
          title: "自動入力不要",
          description: "すべてのフィールドが入力済みです",
        })
        setLoading(false)
        return
      }

      // AI候補生成（モック）
      const mockSuggestions = await generateMockAutoFill(emptyFields, currentData, moduleName)
      setSuggestions(mockSuggestions)
      setShowSuggestions(true)

      toast({
        title: "AI自動入力候補生成完了",
        description: `${mockSuggestions.length}個のフィールドに候補を生成しました`,
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "AI自動入力の生成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyAutoFill = (selectedSuggestions: AutoFillSuggestion[]) => {
    const filledData = { ...currentData }

    selectedSuggestions.forEach((suggestion) => {
      filledData[suggestion.fieldKey] = suggestion.suggestedValue
    })

    onAutoFill(filledData)
    setShowSuggestions(false)

    toast({
      title: "AI自動入力完了",
      description: `${selectedSuggestions.length}個のフィールドを自動入力しました`,
    })
  }

  const applyAllSuggestions = () => {
    applyAutoFill(suggestions)
  }

  const applySingleSuggestion = (suggestion: AutoFillSuggestion) => {
    applyAutoFill([suggestion])
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI自動入力
          </CardTitle>
          <CardDescription>未入力のフィールドをAIが自動で補完します</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateAutoFill} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            {loading ? "AI分析中..." : "AI自動入力候補を生成"}
          </Button>
        </CardContent>
      </Card>

      {showSuggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI自動入力候補</span>
              <Button onClick={applyAllSuggestions} size="sm">
                <Check className="h-4 w-4 mr-2" />
                すべて適用
              </Button>
            </CardTitle>
            <CardDescription>以下の候補を確認して適用してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{suggestion.label}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={suggestion.confidence > 0.8 ? "default" : "secondary"} className="text-xs">
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => applySingleSuggestion(suggestion)}>
                      <Check className="h-3 w-3 mr-1" />
                      適用
                    </Button>
                  </div>
                </div>
                <div className="text-sm bg-gray-50 p-2 rounded">{suggestion.suggestedValue}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {suggestion.reasoning}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// モック関数
async function generateMockAutoFill(
  emptyFields: any[],
  currentData: any,
  moduleName: string,
): Promise<AutoFillSuggestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const suggestions: AutoFillSuggestion[] = []

  emptyFields.forEach((field) => {
    let suggestedValue = ""
    let confidence = 0.7
    let reasoning = ""

    switch (field.field_key) {
      case "notes":
        if (currentData.title) {
          suggestedValue = `${currentData.title}に関する詳細な検討を行います。関係者との調整を含めて進める予定です。`
          confidence = 0.75
          reasoning = "タイトルから推測した標準的な備考"
        }
        break

      case "priority":
        if (currentData.due_date) {
          const dueDate = new Date(currentData.due_date)
          const today = new Date()
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays <= 3) {
            suggestedValue = "high"
            confidence = 0.85
            reasoning = "期限が近いため高優先度を推奨"
          } else if (diffDays <= 7) {
            suggestedValue = "medium"
            confidence = 0.8
            reasoning = "期限まで1週間程度のため中優先度を推奨"
          } else {
            suggestedValue = "low"
            confidence = 0.75
            reasoning = "期限に余裕があるため低優先度を推奨"
          }
        }
        break

      case "description":
        if (currentData.purpose) {
          suggestedValue = `${currentData.purpose}について、以下の点を重点的に検討します：\n・現状分析\n・課題の特定\n・解決策の検討\n・実装計画の策定`
          confidence = 0.78
          reasoning = "目的から推測した標準的な説明"
        }
        break

      case "destination":
        if (currentData.category === "travel") {
          suggestedValue = "東京都内"
          confidence = 0.6
          reasoning = "出張申請の一般的な行き先"
        }
        break
    }

    if (suggestedValue) {
      suggestions.push({
        fieldKey: field.field_key,
        label: field.label,
        suggestedValue,
        confidence,
        reasoning,
      })
    }
  })

  return suggestions
}
