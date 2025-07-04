import { ProjectForm } from "@/components/ocr/project-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewOcrProjectPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/ocr-projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規OCRプロジェクト作成</h1>
            <p className="text-gray-600 mt-2">PDF文書のOCR処理と自動組版プロジェクトを作成します</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>プロジェクト情報</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm mode="create" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
