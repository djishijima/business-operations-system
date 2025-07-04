"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type ApplicationCode = Database["public"]["Tables"]["application_codes"]["Row"]

interface ApprovalFormProps {
  mode: "create" | "edit"
  initialData?: {
    id?: string
    title: string
    category: string
    application_code: string | null
    amount: number | null
    form: any
  }
}

export function ApprovalForm({ mode, initialData }: ApprovalFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [category, setCategory] = useState(initialData?.category || "other")
  const [applicationCode, setApplicationCode] = useState(initialData?.application_code || "none")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [description, setDescription] = useState(initialData?.form?.description || "")
  const [purpose, setPurpose] = useState(initialData?.form?.purpose || "")
  const [applicationCodes, setApplicationCodes] = useState<ApplicationCode[]>([])
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchApplicationCodes()
  }, [])

  const fetchApplicationCodes = async () => {
    try {
      const { data, error } = await supabase.from("application_codes").select("*").eq("is_active", true).order("code")

      if (error) throw error
      setApplicationCodes(data || [])
    } catch (error) {
      toast({
        title: "エラー",
        description: "申請コードの取得に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "エラー",
        description: "ログインが必要です。",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "エラー",
        description: "タイトルを入力してください。",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = {
        description: description.trim(),
        purpose: purpose.trim(),
      }

      const approvalData = {
        title: title.trim(),
        category: category || "other",
        applicant_id: user.id,
        application_code: applicationCode || null,
        amount: amount ? Number.parseFloat(amount) : null,
        form: formData,
        status: "pending" as const,
        updated_at: new Date().toISOString(),
      }

      if (mode === "create") {
        const { error } = await supabase.from("approvals").insert([approvalData])

        if (error) throw error

        toast({
          title: "成功",
          description: "申請を作成しました。",
        })
      } else {
        const { error } = await supabase.from("approvals").update(approvalData).eq("id", initialData?.id)

        if (error) throw error

        toast({
          title: "成功",
          description: "申請を更新しました。",
        })
      }

      router.push("/approvals")
    } catch (error) {
      toast({
        title: "エラー",
        description: mode === "create" ? "申請の作成に失敗しました。" : "申請の更新に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="申請のタイトルを入力"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">経費精算</SelectItem>
              <SelectItem value="leave">休暇申請</SelectItem>
              <SelectItem value="travel">出張申請</SelectItem>
              <SelectItem value="purchase">購入申請</SelectItem>
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="application_code">申請コード</Label>
          <Select value={applicationCode} onValueChange={setApplicationCode}>
            <SelectTrigger>
              <SelectValue placeholder="申請コードを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">選択なし</SelectItem>
              {applicationCodes.map((code) => (
                <SelectItem key={code.id} value={code.code}>
                  {code.code} - {code.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">金額</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="金額を入力（任意）"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">目的・用途</Label>
        <Input
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="申請の目的や用途を入力"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">詳細説明</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="申請の詳細内容を記入してください..."
          rows={6}
        />
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : mode === "create" ? "申請作成" : "申請更新"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
