"use client"

import { useState } from "react"
import { Send, Mail, MessageSquare, Smartphone, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { NotificationService, type NotificationConfig } from "@/lib/notification-service"
import { TemplateEngine } from "@/lib/template-engine"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface NotificationSenderProps {
  moduleName: string
  data: any
  onSent?: () => void
}

export function NotificationSender({ moduleName, data, onSent }: NotificationSenderProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [recipients, setRecipients] = useState<{ [key: string]: string[] }>({
    slack: [],
    email: [],
    sms: [],
  })
  const [customMessage, setCustomMessage] = useState("")
  const [previewContent, setPreviewContent] = useState<{ [key: string]: string }>({})
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const channelOptions = [
    { value: "slack", label: "Slack", icon: MessageSquare, color: "bg-green-100 text-green-800" },
    { value: "email", label: "メール", icon: Mail, color: "bg-blue-100 text-blue-800" },
    { value: "sms", label: "SMS", icon: Smartphone, color: "bg-yellow-100 text-yellow-800" },
  ]

  const handleChannelToggle = (channel: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels([...selectedChannels, channel])
    } else {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel))
    }
  }

  const handleRecipientsChange = (channel: string, value: string) => {
    const recipientList = value
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r)
    setRecipients({
      ...recipients,
      [channel]: recipientList,
    })
  }

  const previewTemplate = async (channel: string) => {
    try {
      const content = await TemplateEngine.generateNotificationTemplate(moduleName, data, channel as any)
      setPreviewContent({
        ...previewContent,
        [channel]: content,
      })
    } catch (error) {
      toast({
        title: "プレビューエラー",
        description: "テンプレートのプレビューに失敗しました",
        variant: "destructive",
      })
    }
  }

  const sendNotifications = async () => {
    if (selectedChannels.length === 0) {
      toast({
        title: "送信チャネル未選択",
        description: "送信するチャネルを選択してください",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const configs: NotificationConfig[] = selectedChannels.map((channel) => ({
        channel: channel as any,
        recipients: recipients[channel] || [],
        priority: "medium",
      }))

      const results = await NotificationService.sendBulkNotifications(moduleName, data, configs)

      const successCount = Object.values(results).filter((result) =>
        Array.isArray(result) ? result.every((r) => r.success) : result.success,
      ).length

      toast({
        title: "通知送信完了",
        description: `${successCount}/${selectedChannels.length}件の通知を送信しました`,
      })

      onSent?.()
    } catch (error) {
      toast({
        title: "送信エラー",
        description: "通知の送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          通知送信
        </CardTitle>
        <CardDescription>選択したチャネルに通知を送信します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* チャネル選択 */}
        <div>
          <Label className="text-base font-medium">送信チャネル</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {channelOptions.map((option) => {
              const IconComponent = option.icon
              const isSelected = selectedChannels.includes(option.value)

              return (
                <div key={option.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleChannelToggle(option.value, checked as boolean)}
                    />
                    <Label htmlFor={option.value} className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <Badge className={option.color}>{option.label}</Badge>
                    </Label>
                  </div>

                  {isSelected && (
                    <div className="space-y-2 ml-6">
                      <Input
                        placeholder={
                          option.value === "email"
                            ? "email1@example.com, email2@example.com"
                            : option.value === "sms"
                              ? "+81-90-1234-5678, +81-80-9876-5432"
                              : "#general, #notifications"
                        }
                        value={recipients[option.value]?.join(", ") || ""}
                        onChange={(e) => handleRecipientsChange(option.value, e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => previewTemplate(option.value)}>
                              プレビュー
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{option.label}プレビュー</DialogTitle>
                              <DialogDescription>送信される内容を確認してください</DialogDescription>
                            </DialogHeader>
                            <Textarea
                              value={previewContent[option.value] || ""}
                              readOnly
                              className="min-h-[200px] font-mono text-sm"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* カスタムメッセージ */}
        <div>
          <Label htmlFor="custom-message">カスタムメッセージ（オプション）</Label>
          <Textarea
            id="custom-message"
            placeholder="追加のメッセージがあれば入力してください"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <Button onClick={sendNotifications} disabled={sending || selectedChannels.length === 0} className="flex-1">
            {sending ? "送信中..." : "通知送信"}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            設定
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
