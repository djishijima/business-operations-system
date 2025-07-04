"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ApplicationCodeForm } from "@/components/application-codes/application-code-form"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type ApplicationCode = Database["public"]["Tables"]["application_codes"]["Row"]

export default function EditApplicationCodePage() {
  const [code, setCode] = useState<ApplicationCode | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchCode()
  }, [])

  const fetchCode = async () => {
    try {
      const { data, error } = await supabase.from("application_codes").select("*").eq("id", params.id).single()

      if (error) throw error
      setCode(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "アプリケーションコードの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!code) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">アプリケーションコードが見つかりません。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">アプリケーションコード編集</h1>
        <p className="text-muted-foreground">コード情報を編集します</p>
      </div>
      <ApplicationCodeForm applicationCode={code} />
    </div>
  )
}
