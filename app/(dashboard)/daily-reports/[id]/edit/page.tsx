"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { DailyReportForm } from "@/components/daily-reports/daily-report-form"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"]

export default function EditDailyReportPage() {
  const params = useParams()
  const { toast } = useToast()
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (id: string) => {
    try {
      const { data, error } = await supabase.from("daily_reports").select("*").eq("id", id).single()

      if (error) throw error
      setReport(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "日報の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">日報が見つかりません。</p>
          <Button asChild className="mt-4">
            <Link href="/daily-reports">日報一覧に戻る</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/daily-reports/${report.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            詳細に戻る
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">日報編集</h1>
          <p className="text-muted-foreground">日報の内容を編集します</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>日報情報</CardTitle>
          <CardDescription>日報の詳細情報を編集してください</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyReportForm
            mode="edit"
            initialData={{
              id: report.id,
              report_date: report.report_date,
              summary: report.summary,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
