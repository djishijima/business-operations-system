import { supabase } from "@/lib/supabase"
import { TemplateEngine } from "@/lib/template-engine"

export interface NotificationConfig {
  channel: "slack" | "email" | "sms"
  templateId?: string
  customTemplate?: string
  recipients: string[]
  priority?: "low" | "medium" | "high"
}

export interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
  deliveredAt?: Date
}

export class NotificationService {
  /**
   * Slack通知送信
   */
  static async sendSlackNotification(
    webhookUrl: string,
    message: string,
    options: {
      channel?: string
      username?: string
      iconEmoji?: string
      attachments?: any[]
    } = {},
  ): Promise<NotificationResult> {
    try {
      const payload = {
        text: message,
        channel: options.channel || "#general",
        username: options.username || "業務管理システム",
        icon_emoji: options.iconEmoji || ":robot_face:",
        attachments: options.attachments || [],
      }

      // 実際の実装では fetch でWebhook送信
      console.log("Slack notification:", payload)

      // モック成功レスポンス
      return {
        success: true,
        messageId: `slack_${Date.now()}`,
        deliveredAt: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * メール送信（Resend API使用想定）
   */
  static async sendEmailNotification(
    to: string[],
    subject: string,
    content: string,
    options: {
      from?: string
      cc?: string[]
      bcc?: string[]
      attachments?: any[]
    } = {},
  ): Promise<NotificationResult> {
    try {
      const payload = {
        from: options.from || "noreply@company.com",
        to,
        cc: options.cc,
        bcc: options.bcc,
        subject,
        html: content,
        attachments: options.attachments,
      }

      // 実際の実装では Resend API 呼び出し
      console.log("Email notification:", payload)

      return {
        success: true,
        messageId: `email_${Date.now()}`,
        deliveredAt: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * SMS送信（Twilio API使用想定）
   */
  static async sendSmsNotification(
    to: string[],
    message: string,
    options: {
      from?: string
    } = {},
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []

    for (const phoneNumber of to) {
      try {
        const payload = {
          from: options.from || "+1234567890",
          to: phoneNumber,
          body: message,
        }

        // 実際の実装では Twilio API 呼び出し
        console.log("SMS notification:", payload)

        results.push({
          success: true,
          messageId: `sms_${Date.now()}_${phoneNumber}`,
          deliveredAt: new Date(),
        })
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return results
  }

  /**
   * テンプレートベース通知送信
   */
  static async sendTemplateNotification(
    moduleName: string,
    templateName: string,
    data: any,
    config: NotificationConfig,
  ): Promise<NotificationResult | NotificationResult[]> {
    try {
      // テンプレート取得
      const { data: template, error } = await supabase
        .from("module_templates")
        .select("*")
        .eq("module_name", moduleName)
        .eq("name", templateName)
        .eq("template_type", config.channel)
        .single()

      if (error || !template) {
        throw new Error(`Template not found: ${moduleName}/${templateName}/${config.channel}`)
      }

      // テンプレート展開
      const expandedContent = TemplateEngine.expandTemplate(template.content, data)

      // チャネル別送信
      switch (config.channel) {
        case "slack":
          return await this.sendSlackNotification(process.env.SLACK_WEBHOOK_URL || "", expandedContent)

        case "email":
          const subject = this.extractEmailSubject(expandedContent)
          const body = this.extractEmailBody(expandedContent)
          return await this.sendEmailNotification(config.recipients, subject, body)

        case "sms":
          return await this.sendSmsNotification(config.recipients, expandedContent)

        default:
          throw new Error(`Unsupported channel: ${config.channel}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * 一括通知送信
   */
  static async sendBulkNotifications(
    moduleName: string,
    data: any,
    configs: NotificationConfig[],
  ): Promise<{ [key: string]: NotificationResult | NotificationResult[] }> {
    const results: { [key: string]: NotificationResult | NotificationResult[] } = {}

    for (const config of configs) {
      const templateName = this.getDefaultTemplateName(moduleName, config.channel)
      const result = await this.sendTemplateNotification(moduleName, templateName, data, config)
      results[`${config.channel}_${templateName}`] = result
    }

    return results
  }

  /**
   * 通知履歴保存
   */
  static async saveNotificationHistory(
    moduleName: string,
    linkedId: string,
    channel: string,
    content: string,
    recipients: string[],
    result: NotificationResult | NotificationResult[],
  ): Promise<void> {
    try {
      const historyData = {
        module_name: moduleName,
        linked_id: linkedId,
        channel,
        content,
        recipients: JSON.stringify(recipients),
        result: JSON.stringify(result),
        sent_at: new Date().toISOString(),
      }

      // 実際の実装では notification_history テーブルに保存
      console.log("Notification history:", historyData)
    } catch (error) {
      console.error("Failed to save notification history:", error)
    }
  }

  // ヘルパーメソッド
  private static extractEmailSubject(content: string): string {
    const match = content.match(/^件名:\s*(.+)$/m)
    return match ? match[1].trim() : "通知"
  }

  private static extractEmailBody(content: string): string {
    return content.replace(/^件名:\s*.+$/m, "").trim()
  }

  private static getDefaultTemplateName(moduleName: string, channel: string): string {
    const defaults: { [key: string]: { [key: string]: string } } = {
      leads: {
        slack: "Slack通知",
        email: "フォローアップメール",
        sms: "リード通知",
      },
      tasks: {
        slack: "タスク更新通知",
        email: "タスク完了報告",
        sms: "タスク通知",
      },
      approvals: {
        slack: "承認通知",
        email: "承認完了メール",
        sms: "承認通知",
      },
    }

    return defaults[moduleName]?.[channel] || `${channel}通知`
  }
}
