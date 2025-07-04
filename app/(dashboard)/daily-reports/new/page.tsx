"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyReportForm } from "@/components/daily-reports/daily-report-form"

export default function NewDailyReportPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">新規日報作成</h1>
        <p className="text-muted-foreground">新しい日報を作成します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>日報情報</CardTitle>
          <CardDescription>日報の詳細情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyReportForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
