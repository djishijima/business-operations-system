import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type FieldDefinition = Database["public"]["Tables"]["field_definitions"]["Row"]

export interface TemplateContext {
  [key: string]: any
}

export class TemplateEngine {
  /**
   * 変数展開可能なフィールドを取得
   */
  static async getVariableFields(moduleName: string): Promise<FieldDefinition[]> {
    const { data, error } = await supabase
      .from("field_definitions")
      .select("*")
      .eq("module_name", moduleName)
      .eq("variable_enabled", true)
      .eq("visible", true)
      .order("order_index")

    if (error) throw error
    return data || []
  }

  /**
   * AI対象フィールドを取得
   */
  static async getAiFields(moduleName: string): Promise<FieldDefinition[]> {
    const { data, error } = await supabase
      .from("field_definitions")
      .select("*")
      .eq("module_name", moduleName)
      .eq("ai_enabled", true)
      .eq("visible", true)
      .order("order_index")

    if (error) throw error
    return data || []
  }

  /**
   * テンプレート文字列内の {{field_key}} を実際の値に置換
   */
  static expandTemplate(template: string, context: TemplateContext): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, fieldKey) => {
      const value = context[fieldKey]
      if (value === undefined || value === null) {
        return match // 値が見つからない場合は元の {{field_key}} を残す
      }
      return String(value)
    })
  }

  /**
   * AI用プロンプトを自動生成
   */
  static async generateAiPrompt(
    moduleName: string,
    data: TemplateContext,
    promptType: "summary" | "analysis" | "suggestion" = "summary",
  ): Promise<string> {
    const fields = await this.getAiFields(moduleName)

    const fieldPrompts = fields
      .filter((field) => data[field.field_key] !== undefined && data[field.field_key] !== null)
      .map((field) => {
        const value = data[field.field_key]
        let displayValue = value

        // select型の場合、optionsからlabelを取得
        if (field.type === "select" && field.options) {
          const options = Array.isArray(field.options) ? field.options : []
          const option = options.find((opt: any) => opt.value === value)
          displayValue = option?.label || value
        }

        // boolean型の場合、日本語に変換
        if (field.type === "boolean") {
          displayValue = value ? "はい" : "いいえ"
        }

        return `${field.label}: ${displayValue}`
      })
      .join("\n")

    const moduleLabels = {
      leads: "リード",
      tasks: "タスク",
      approvals: "承認申請",
      users: "ユーザー",
      payment_recipients: "支払先",
      application_codes: "アプリケーションコード",
      nextcloud_files: "ファイル",
    }

    const moduleLabel = moduleLabels[moduleName as keyof typeof moduleLabels] || moduleName

    const promptTemplates = {
      summary: `以下の${moduleLabel}情報を要約してください：\n\n${fieldPrompts}`,
      analysis: `以下の${moduleLabel}情報を分析し、改善点や注意点を提案してください：\n\n${fieldPrompts}`,
      suggestion: `以下の${moduleLabel}情報に基づいて、次のアクションを提案してください：\n\n${fieldPrompts}`,
    }

    return promptTemplates[promptType]
  }

  /**
   * 通知用テンプレートを生成（Slack、メール等）
   */
  static async generateNotificationTemplate(
    moduleName: string,
    data: TemplateContext,
    templateType: "slack" | "email" | "sms" = "slack",
  ): Promise<string> {
    const fields = await this.getVariableFields(moduleName)

    const templates = {
      slack: {
        leads: `🎯 新しいリード: {{company_name}} - {{name}}\nステータス: {{status}}\n担当者: {{assigned_to}}`,
        tasks: `📋 タスク更新: {{title}}\nステータス: {{status}}\n期限: {{due_date}}\n優先度: {{priority}}`,
        approvals: `📝 承認申請: {{category}} - {{purpose}}\n金額: {{amount}}円\n申請者: {{applicant_name}}`,
        users: `👤 ユーザー更新: {{name}} ({{employee_id}})\n役割: {{role}}\nステータス: {{status}}`,
        payment_recipients: `💰 支払先登録: {{recipient_name}}\n銀行: {{bank_name}} {{branch_name}}`,
        application_codes: `🏷️ コード更新: {{code}} - {{label}}\nカテゴリ: {{category}}`,
        nextcloud_files: `📎 ファイル追加: {{file_name}}\n関連: {{linked_type}}`,
      },
      email: {
        leads: `件名: 新規リード登録 - {{company_name}}\n\n{{company_name}}の{{name}}様より新規お問い合わせをいただきました。\n\nステータス: {{status}}\n担当者: {{assigned_to}}\n備考: {{notes}}`,
        tasks: `件名: タスク更新通知 - {{title}}\n\nタスクが更新されました。\n\nタスク名: {{title}}\nステータス: {{status}}\n期限: {{due_date}}\n優先度: {{priority}}\n\n詳細: {{notes}}`,
        approvals: `件名: 承認申請 - {{category}}\n\n承認申請が提出されました。\n\n種類: {{category}}\n目的: {{purpose}}\n金額: {{amount}}円\n日付: {{date}}\n\n詳細: {{description}}`,
        users: `件名: ユーザーアカウント更新 - {{name}}\n\nユーザーアカウントが更新されました。\n\n名前: {{name}}\n従業員ID: {{employee_id}}\n役割: {{role}}\nステータス: {{status}}`,
        payment_recipients: `件名: 支払先登録完了 - {{recipient_name}}\n\n新しい支払先が登録されました。\n\n受取人: {{recipient_name}}\n銀行: {{bank_name}}\n支店: {{branch_name}}\n口座番号: {{account_number}}`,
        application_codes: `件名: アプリケーションコード更新 - {{code}}\n\nコードが更新されました。\n\nコード: {{code}}\nラベル: {{label}}\nカテゴリ: {{category}}\n説明: {{description}}`,
        nextcloud_files: `件名: ファイルアップロード完了 - {{file_name}}\n\nファイルがアップロードされました。\n\nファイル名: {{file_name}}\n関連タイプ: {{linked_type}}\nMIMEタイプ: {{mime_type}}`,
      },
      sms: {
        leads: `新規リード: {{company_name}} - {{name}} ({{status}})`,
        tasks: `タスク更新: {{title}} - {{status}} (期限: {{due_date}})`,
        approvals: `承認申請: {{category}} - {{purpose}} ({{amount}}円)`,
        users: `ユーザー更新: {{name}} - {{role}}`,
        payment_recipients: `支払先登録: {{recipient_name}} - {{bank_name}}`,
        application_codes: `コード更新: {{code}} - {{label}}`,
        nextcloud_files: `ファイル追加: {{file_name}}`,
      },
    }

    const template = templates[templateType][moduleName as keyof (typeof templates)[typeof templateType]]
    if (!template) {
      throw new Error(`Template not found for ${moduleName} - ${templateType}`)
    }

    return this.expandTemplate(template, data)
  }

  /**
   * テンプレートで使用可能な変数一覧を取得
   */
  static async getAvailableVariables(moduleName: string): Promise<string[]> {
    const fields = await this.getVariableFields(moduleName)
    return fields.map((field) => field.field_key)
  }

  /**
   * テンプレートの変数検証
   */
  static async validateTemplate(
    template: string,
    moduleName: string,
  ): Promise<{
    isValid: boolean
    missingVariables: string[]
    availableVariables: string[]
  }> {
    const availableVariables = await this.getAvailableVariables(moduleName)
    const usedVariables = template.match(/\{\{(\w+)\}\}/g)?.map((match) => match.replace(/\{\{|\}\}/g, "")) || []

    const missingVariables = usedVariables.filter((variable) => !availableVariables.includes(variable))

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
      availableVariables,
    }
  }
}
