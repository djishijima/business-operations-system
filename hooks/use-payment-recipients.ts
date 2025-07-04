"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type PaymentRecipient = Database["public"]["Tables"]["payment_recipients"]["Row"]

interface PaymentRecipientOption {
  value: string
  label: string
  data: PaymentRecipient
}

export function usePaymentRecipients() {
  const [recipients, setRecipients] = useState<PaymentRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipients()
  }, [])

  const fetchRecipients = async () => {
    try {
      setLoading(true)
      setError(null)

      // payment_recipients テーブルにはstatusカラムが存在しないため、全件取得
      const { data, error: fetchError } = await supabase
        .from("payment_recipients")
        .select("*")
        .order("recipient_name", { ascending: true })

      if (fetchError) throw fetchError

      setRecipients(data || [])
    } catch (err: any) {
      console.error("支払先取得エラー:", err)
      setError(err.message || "支払先の取得に失敗しました")
      toast({
        title: "エラー",
        description: "支払先の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Select用のオプション配列を生成
  const recipientOptions: PaymentRecipientOption[] = recipients.map((recipient) => ({
    value: recipient.id,
    label: `${recipient.recipient_name}${recipient.bank_name ? ` (${recipient.bank_name})` : ""}`,
    data: recipient,
  }))

  // 特定のIDで支払先情報を取得
  const getRecipientById = (id: string): PaymentRecipient | undefined => {
    return recipients.find((recipient) => recipient.id === id)
  }

  // 支払先名で検索
  const searchRecipients = (query: string): PaymentRecipient[] => {
    if (!query.trim()) return recipients

    const lowerQuery = query.toLowerCase()
    return recipients.filter(
      (recipient) =>
        recipient.recipient_name.toLowerCase().includes(lowerQuery) ||
        recipient.bank_name?.toLowerCase().includes(lowerQuery) ||
        recipient.account_holder?.toLowerCase().includes(lowerQuery),
    )
  }

  // Select用のオプション配列を取得（互換性のため）
  const getRecipientOptions = () => recipientOptions

  return {
    recipients,
    recipientOptions,
    loading,
    error,
    refetch: fetchRecipients,
    getRecipientById,
    searchRecipients,
    getRecipientOptions,
  }
}
