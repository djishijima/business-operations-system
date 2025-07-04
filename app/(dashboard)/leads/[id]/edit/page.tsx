"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { LeadForm } from "@/components/leads/lead-form"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type Lead = Database["public"]["Tables"]["leads"]["Row"]

export default function EditLeadPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchLead(params.id as string)
    }
  }, [params.id])

  const fetchLead = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).single()

      if (error) {
        console.error("Failed to fetch lead:", error)
        throw error
      }

      setLead(data)
    } catch (error: any) {
      console.error("Error fetching lead:", error)
      toast({
        title: "エラー",
        description: "リード情報の取得に失敗しました。",
        variant: "destructive",
      })
      router.push("/leads")
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    router.push(`/leads/${params.id}`)
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

  if (!lead) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">リードが見つかりません。</p>
          <Button asChild className="mt-4">
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              リード一覧に戻る
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/leads/${lead.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">リード編集</h1>
            <p className="text-muted-foreground">
              {lead.name} - {lead.company_name}
            </p>
          </div>
        </div>
      </div>
      <LeadForm lead={lead} onSuccess={handleSuccess} />
    </div>
  )
}
