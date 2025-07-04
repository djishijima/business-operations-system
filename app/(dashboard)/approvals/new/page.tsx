import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApprovalForm } from "@/components/approvals/approval-form"

export default function NewApprovalPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">新規申請作成</h1>
        <p className="text-muted-foreground">新しい申請を作成します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>申請情報</CardTitle>
          <CardDescription>申請の詳細情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
