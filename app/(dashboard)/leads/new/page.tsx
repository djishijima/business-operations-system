"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeadForm } from "@/components/leads/lead-form"
import Link from "next/link"

export default function NewLeadPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規リード作成</h1>
            <p className="text-muted-foreground">新しいリード情報を登録します</p>
          </div>
        </div>
      </div>
      <LeadForm />
    </div>
  )
}
