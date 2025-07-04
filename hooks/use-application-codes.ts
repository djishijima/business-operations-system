"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type ApplicationCode = Database["public"]["Tables"]["application_codes"]["Row"]

export function useApplicationCodes(category?: string) {
  const [codes, setCodes] = useState<ApplicationCode[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCodes()
  }, [category])

  const fetchCodes = async () => {
    try {
      let query = supabase
        .from("application_codes")
        .select("*")
        .eq("is_active", true)
        .order("code", { ascending: true })

      if (category) {
        query = query.eq("category", category)
      }

      const { data, error } = await query

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      console.error("申請コード取得エラー:", error)
      toast({
        title: "エラー",
        description: "申請コードの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCodeOptions = () => {
    return codes.map((code) => ({
      label: `${code.code} - ${code.label}`,
      value: code.code,
      data: code,
    }))
  }

  const getCodeByValue = (value: string) => {
    return codes.find((code) => code.code === value)
  }

  const getCodesByCategory = (targetCategory: string) => {
    return codes.filter((code) => code.category === targetCategory)
  }

  return {
    codes,
    loading,
    getCodeOptions,
    getCodeByValue,
    getCodesByCategory,
    refetch: fetchCodes,
  }
}
