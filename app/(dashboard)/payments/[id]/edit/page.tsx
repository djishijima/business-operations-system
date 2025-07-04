"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PaymentRecipientForm } from "@/components/payment-recipients/payment-recipient-form"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type PaymentRecipient = Database["public"]["Tables"]["payment_recipients"]["Row"]

export default function EditPaymentPage() {
  const [recipient, setRecipient] = useState<PaymentRecipient | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipient()
  }, [])

  const fetchRecipient = async () => {
    try {
      const { data, error } = await supabase.from("payment_recipients").select("*").eq("id", params.id).single()

      if (error) throw error
      setRecipient(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "支払先の取得に失敗しました。",
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

  if (!recipient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">支払先が見つかりません。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">支払先編集</h1>
        <p className="text-muted-foreground">支払先情報を編集します</p>
      </div>
      <PaymentRecipientForm paymentRecipient={recipient} />
    </div>
  )
}
