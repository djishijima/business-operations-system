"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type PaymentRecipient = Database["public"]["Tables"]["payment_recipients"]["Row"]

const formSchema = z.object({
  recipient_name: z.string().min(1, "受取人名は必須です"),
  bank_name: z.string().optional(),
  bank_code: z.string().optional(),
  branch_name: z.string().optional(),
  branch_code: z.string().optional(),
  account_type: z.enum(["ordinary", "checking"]).optional(),
  account_number: z.string().optional(),
  account_holder: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
})

interface PaymentRecipientFormProps {
  paymentRecipient?: PaymentRecipient
  onSuccess?: () => void
}

export function PaymentRecipientForm({ paymentRecipient, onSuccess }: PaymentRecipientFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient_name: paymentRecipient?.recipient_name || "",
      bank_name: paymentRecipient?.bank_name || "",
      bank_code: paymentRecipient?.bank_code || "",
      branch_name: paymentRecipient?.branch_name || "",
      branch_code: paymentRecipient?.branch_code || "",
      account_type: paymentRecipient?.account_type || undefined,
      account_number: paymentRecipient?.account_number || "",
      account_holder: paymentRecipient?.account_holder || "",
      phone: paymentRecipient?.phone || "",
      email: paymentRecipient?.email || "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    try {
      const recipientData = {
        ...values,
        bank_name: values.bank_name || null,
        bank_code: values.bank_code || null,
        branch_name: values.branch_name || null,
        branch_code: values.branch_code || null,
        account_type: values.account_type || null,
        account_number: values.account_number || null,
        account_holder: values.account_holder || null,
        phone: values.phone || null,
        email: values.email || null,
      }

      if (paymentRecipient) {
        const { error } = await supabase.from("payment_recipients").update(recipientData).eq("id", paymentRecipient.id)
        if (error) throw error
        toast({ title: "成功", description: "支払先を更新しました。" })
      } else {
        const { error } = await supabase.from("payment_recipients").insert([recipientData])
        if (error) throw error
        toast({ title: "成功", description: "支払先を作成しました。" })
      }

      onSuccess?.()
      router.push("/payment-recipients")
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message || "操作に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{paymentRecipient ? "支払先編集" : "新規支払先作成"}</CardTitle>
        <CardDescription>支払先の銀行口座情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>受取人名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="株式会社サンプル" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input placeholder="03-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">銀行口座情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>銀行名</FormLabel>
                      <FormControl>
                        <Input placeholder="みずほ銀行" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>銀行コード</FormLabel>
                      <FormControl>
                        <Input placeholder="0001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>支店名</FormLabel>
                      <FormControl>
                        <Input placeholder="新宿支店" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>支店コード</FormLabel>
                      <FormControl>
                        <Input placeholder="001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>口座種別</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="口座種別を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ordinary">普通</SelectItem>
                          <SelectItem value="checking">当座</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>口座番号</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_holder"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>口座名義</FormLabel>
                      <FormControl>
                        <Input placeholder="カ）サンプル" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : paymentRecipient ? "更新" : "作成"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/payment-recipients")}>
                キャンセル
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
