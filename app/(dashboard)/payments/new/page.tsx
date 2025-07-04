"use client"

import { PaymentRecipientForm } from "@/components/payment-recipients/payment-recipient-form"

export default function NewPaymentPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">新規支払先作成</h1>
        <p className="text-muted-foreground">新しい支払先の銀行口座情報を登録します</p>
      </div>
      <PaymentRecipientForm />
    </div>
  )
}
