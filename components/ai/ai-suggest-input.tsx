"use client"

import { useState, useEffect, useRef } from "react"
import { Check, X, Loader2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface AiSuggestInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  fieldKey: string
  moduleName: string
  contextData?: any
  type?: "text" | "textarea"
  className?: string
}

interface AiSuggestion {
  text: string
  confidence: number
  reasoning: string
}

export function AiSuggestInput({
  value,
  onChange,
  placeholder,
  fieldKey,
  moduleName,
  contextData = {},
  type = "text",
  className,
}: AiSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"valid" | "invalid" | "pending" | null>(null)
  const [validationMessage, setValidationMessage] = useState<string>("")
  const debounceRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  // AI候補生成
  const generateSuggestions = async (inputValue: string) => {
    if (!inputValue.trim() || inputValue.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      // 実際の実装では /api/ai/suggest を呼び出し
      const mockSuggestions = await generateMockSuggestions(inputValue, fieldKey, moduleName, contextData)
      setSuggestions(mockSuggestions)
      setShowSuggestions(true)
    } catch (error) {
      console.error("AI suggestion error:", error)
    } finally {
      setLoading(false)
    }
  }

  // AI妥当性検証
  const validateInput = async (inputValue: string) => {
    if (!inputValue.trim()) {
      setValidationStatus(null)
      return
    }

    setValidationStatus("pending")
    try {
      // 実際の実装では /api/ai/validate を呼び出し
      const validation = await validateMockInput(inputValue, fieldKey, moduleName, contextData)
      setValidationStatus(validation.isValid ? "valid" : "invalid")
      setValidationMessage(validation.message)
    } catch (error) {
      setValidationStatus(null)
    }
  }

  // デバウンス処理
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (value) {
        generateSuggestions(value)
        validateInput(value)
      }
    }, 800)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, fieldKey, moduleName])

  const applySuggestion = (suggestion: AiSuggestion) => {
    onChange(suggestion.text)
    setShowSuggestions(false)
    toast({
      title: "AI候補を適用",
      description: `「${suggestion.text}」を入力しました`,
    })
  }

  const InputComponent = type === "textarea" ? Textarea : Input

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            className,
            validationStatus === "valid" && "border-green-500",
            validationStatus === "invalid" && "border-red-500",
            validationStatus === "pending" && "border-yellow-500",
          )}
        />

        {/* AI状態インジケーター */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          {validationStatus === "valid" && <Check className="h-4 w-4 text-green-500" />}
          {validationStatus === "invalid" && <X className="h-4 w-4 text-red-500" />}
          {validationStatus === "pending" && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
        </div>
      </div>

      {/* 妥当性検証メッセージ */}
      {validationMessage && (
        <div
          className={cn(
            "text-xs px-2 py-1 rounded",
            validationStatus === "valid" && "text-green-700 bg-green-50",
            validationStatus === "invalid" && "text-red-700 bg-red-50",
          )}
        >
          {validationMessage}
        </div>
      )}

      {/* AI候補表示 */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 shadow-lg">
          <CardContent className="p-2">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              AI候補
            </div>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex-1">
                    <div className="text-sm">{suggestion.text}</div>
                    <div className="text-xs text-muted-foreground">{suggestion.reasoning}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setShowSuggestions(false)}>
              閉じる
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// モック関数（実際の実装では API 呼び出し）
async function generateMockSuggestions(
  input: string,
  fieldKey: string,
  moduleName: string,
  context: any,
): Promise<AiSuggestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // API遅延シミュレーション

  const suggestions: Record<string, AiSuggestion[]> = {
    purpose: [
      {
        text: `${input}に関する業務効率化のため`,
        confidence: 0.85,
        reasoning: "一般的な業務目的として適切",
      },
      {
        text: `${input}の品質向上を目的として`,
        confidence: 0.78,
        reasoning: "品質改善は重要な目的",
      },
    ],
    title: [
      {
        text: `${input}の実装と検証`,
        confidence: 0.82,
        reasoning: "実装と検証はセットで行うべき",
      },
      {
        text: `${input}に関する調査・分析`,
        confidence: 0.75,
        reasoning: "調査分析は基本的なアプローチ",
      },
    ],
    notes: [
      {
        text: `${input}について詳細な検討が必要です。関係者との調整を含めて進めます。`,
        confidence: 0.8,
        reasoning: "詳細検討と関係者調整は重要",
      },
    ],
  }

  return suggestions[fieldKey] || []
}

async function validateMockInput(
  input: string,
  fieldKey: string,
  moduleName: string,
  context: any,
): Promise<{ isValid: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 簡単な妥当性チェック
  if (input.length < 5) {
    return {
      isValid: false,
      message: "もう少し詳しく入力してください",
    }
  }

  if (fieldKey === "purpose" && !input.includes("ため")) {
    return {
      isValid: false,
      message: "目的には「〜のため」という表現を含めることをお勧めします",
    }
  }

  return {
    isValid: true,
    message: "適切な入力です",
  }
}
