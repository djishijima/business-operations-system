"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type FieldDefinition = Database["public"]["Tables"]["field_definitions"]["Row"]

export function useDynamicForm(moduleName: string) {
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (moduleName) {
      fetchFields()
    }
  }, [moduleName])

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from("field_definitions")
        .select("*")
        .eq("module_name", moduleName)
        .eq("visible", true)
        .order("order_index", { ascending: true })

      if (error) throw error
      setFields(data || [])
    } catch (error) {
      console.error("フィールド定義取得エラー:", error)
      toast({
        title: "エラー",
        description: "フィールド定義の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getFieldsByType = (type: string) => {
    return fields.filter((field) => field.type === type)
  }

  const getRequiredFields = () => {
    return fields.filter((field) => field.required)
  }

  const getAiEnabledFields = () => {
    return fields.filter((field) => field.ai_enabled)
  }

  const validateFormData = (formData: Record<string, any>) => {
    const errors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required && (!formData[field.field_key] || formData[field.field_key] === "")) {
        errors[field.field_key] = `${field.label}は必須項目です。`
      }

      // バリデーションルールがある場合の検証
      if (field.validation && formData[field.field_key]) {
        const validation = field.validation as any
        const value = formData[field.field_key]

        if (validation.minLength && value.length < validation.minLength) {
          errors[field.field_key] = `${field.label}は${validation.minLength}文字以上で入力してください。`
        }

        if (validation.maxLength && value.length > validation.maxLength) {
          errors[field.field_key] = `${field.label}は${validation.maxLength}文字以下で入力してください。`
        }

        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          errors[field.field_key] = `${field.label}の形式が正しくありません。`
        }
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  return {
    fields,
    loading,
    getFieldsByType,
    getRequiredFields,
    getAiEnabledFields,
    validateFormData,
    refetch: fetchFields,
  }
}
