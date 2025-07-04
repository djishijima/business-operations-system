import { supabase } from "@/lib/supabase"

export interface SearchResult {
  id: string
  table_name: string
  title: string
  subtitle?: string
  content?: string
  status: string
  created_at: string
  updated_at: string
  relevance_score?: number
  highlight?: string
}

export interface SearchOptions {
  query: string
  tables?: string[]
  limit?: number
  offset?: number
  sortBy?: "relevance" | "date" | "title"
  sortOrder?: "asc" | "desc"
}

export interface SearchStats {
  total_results: number
  search_time_ms: number
  tables_searched: string[]
  query_suggestions?: string[]
}

export class SearchService {
  /**
   * 全文検索実行
   */
  static async fullTextSearch(options: SearchOptions): Promise<{
    results: SearchResult[]
    stats: SearchStats
  }> {
    const startTime = Date.now()

    try {
      let query = supabase.from("unified_search_view").select("*")

      // 検索クエリ適用
      if (options.query.trim()) {
        const searchQuery = options.query
          .split(/\s+/)
          .map((term) => term.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ""))
          .filter((term) => term.length > 0)
          .join(" & ")

        query = query.textSearch("search_vector", searchQuery, {
          type: "websearch",
          config: "japanese",
        })
      }

      // テーブルフィルター
      if (options.tables && options.tables.length > 0) {
        query = query.in("table_name", options.tables)
      }

      // ソート
      switch (options.sortBy) {
        case "date":
          query = query.order("created_at", { ascending: options.sortOrder === "asc" })
          break
        case "title":
          query = query.order("title", { ascending: options.sortOrder === "asc" })
          break
        default:
          // relevance sort (PostgreSQL's ts_rank)
          break
      }

      // ページネーション
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      const searchTime = Date.now() - startTime
      const results = (data || []).map((item) => ({
        ...item,
        relevance_score: Math.random() * 0.5 + 0.5, // モック relevance score
        highlight: this.generateHighlight(item.content || item.title, options.query),
      }))

      // 検索履歴保存
      await this.saveSearchHistory({
        query: options.query,
        table_filter: options.tables?.join(","),
        results_count: results.length,
        search_type: "fulltext",
      })

      return {
        results,
        stats: {
          total_results: count || results.length,
          search_time_ms: searchTime,
          tables_searched: options.tables || ["all"],
          query_suggestions: await this.generateQuerySuggestions(options.query),
        },
      }
    } catch (error) {
      console.error("Full-text search error:", error)
      return {
        results: [],
        stats: {
          total_results: 0,
          search_time_ms: Date.now() - startTime,
          tables_searched: [],
          query_suggestions: [],
        },
      }
    }
  }

  /**
   * AI検索・要約生成
   */
  static async aiSearch(
    query: string,
    options: {
      summarize?: boolean
      maxResults?: number
    } = {},
  ): Promise<{
    results: SearchResult[]
    summary?: string
    insights?: string[]
  }> {
    try {
      // まず通常の検索を実行
      const searchResults = await this.fullTextSearch({
        query,
        limit: options.maxResults || 10,
      })

      let summary: string | undefined
      let insights: string[] = []

      if (options.summarize && searchResults.results.length > 0) {
        // AI要約生成（モック）
        summary = await this.generateAiSummary(query, searchResults.results)
        insights = await this.generateInsights(searchResults.results)
      }

      // AI検索履歴保存
      await this.saveSearchHistory({
        query,
        results_count: searchResults.results.length,
        search_type: "ai",
      })

      return {
        results: searchResults.results,
        summary,
        insights,
      }
    } catch (error) {
      console.error("AI search error:", error)
      return {
        results: [],
        summary: "検索中にエラーが発生しました。",
        insights: [],
      }
    }
  }

  /**
   * 類似検索（ベクトル検索シミュレーション）
   */
  static async similaritySearch(
    referenceId: string,
    tableName: string,
    options: { limit?: number } = {},
  ): Promise<SearchResult[]> {
    try {
      // 参照データ取得
      const { data: referenceData } = await supabase
        .from("unified_search_view")
        .select("*")
        .eq("id", referenceId)
        .eq("table_name", tableName)
        .single()

      if (!referenceData) {
        return []
      }

      // 類似検索（モック実装）
      const { data, error } = await supabase
        .from("unified_search_view")
        .select("*")
        .eq("table_name", tableName)
        .neq("id", referenceId)
        .limit(options.limit || 5)

      if (error) throw error

      // 類似度スコア計算（モック）
      const results = (data || [])
        .map((item) => ({
          ...item,
          relevance_score: Math.random() * 0.4 + 0.6, // 0.6-1.0の範囲
        }))
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))

      return results
    } catch (error) {
      console.error("Similarity search error:", error)
      return []
    }
  }

  /**
   * 検索候補生成
   */
  static async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("search_history")
        .select("query")
        .ilike("query", `${partialQuery}%`)
        .limit(5)

      if (error) throw error

      return (data || []).map((item) => item.query)
    } catch (error) {
      console.error("Search suggestions error:", error)
      return []
    }
  }

  /**
   * 検索履歴保存
   */
  private static async saveSearchHistory(historyData: {
    query: string
    table_filter?: string
    results_count: number
    search_type: "fulltext" | "vector" | "ai"
  }): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("search_history").insert({
          user_id: user.id,
          ...historyData,
        })
      }
    } catch (error) {
      console.error("Failed to save search history:", error)
    }
  }

  /**
   * ハイライト生成
   */
  private static generateHighlight(text: string, query: string): string {
    if (!text || !query) return text

    const terms = query.split(/\s+/).filter((term) => term.length > 1)
    let highlighted = text

    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi")
      highlighted = highlighted.replace(regex, "<mark>$1</mark>")
    })

    // 150文字程度に切り詰め
    if (highlighted.length > 150) {
      const markIndex = highlighted.indexOf("<mark>")
      const start = Math.max(0, markIndex - 50)
      const end = Math.min(highlighted.length, start + 150)
      highlighted = "..." + highlighted.substring(start, end) + "..."
    }

    return highlighted
  }

  /**
   * クエリ候補生成
   */
  private static async generateQuerySuggestions(query: string): Promise<string[]> {
    // 実際の実装では機械学習モデルや統計的手法を使用
    const suggestions = [`${query} 詳細`, `${query} 履歴`, `${query} 関連`, `${query} 分析`]

    return suggestions.slice(0, 3)
  }

  /**
   * AI要約生成（モック）
   */
  private static async generateAiSummary(query: string, results: SearchResult[]): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // API遅延シミュレーション

    const resultCount = results.length
    const tables = [...new Set(results.map((r) => r.table_name))]

    return `「${query}」に関する検索結果：${resultCount}件のデータが見つかりました。主に${tables.join("、")}から検索されています。最新の情報では、${results[0]?.title}などが関連性が高く、全体的に${results.filter((r) => r.status === "active" || r.status === "done").length}件が完了・有効状態です。`
  }

  /**
   * インサイト生成（モック）
   */
  private static async generateInsights(results: SearchResult[]): Promise<string[]> {
    const insights = []

    // ステータス分析
    const statusCounts = results.reduce(
      (acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1
        return acc
      },
      {} as { [key: string]: number },
    )

    const mostCommonStatus = Object.entries(statusCounts).sort(([, a], [, b]) => b - a)[0]

    if (mostCommonStatus) {
      insights.push(`最も多いステータス: ${mostCommonStatus[0]} (${mostCommonStatus[1]}件)`)
    }

    // 時期分析
    const recentResults = results.filter((r) => {
      const createdAt = new Date(r.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdAt > weekAgo
    })

    if (recentResults.length > 0) {
      insights.push(`過去1週間で${recentResults.length}件の新しいデータがあります`)
    }

    // テーブル分析
    const tableCounts = results.reduce(
      (acc, result) => {
        acc[result.table_name] = (acc[result.table_name] || 0) + 1
        return acc
      },
      {} as { [key: string]: number },
    )

    const mostActiveTable = Object.entries(tableCounts).sort(([, a], [, b]) => b - a)[0]

    if (mostActiveTable) {
      insights.push(`最も関連性の高いモジュール: ${mostActiveTable[0]} (${mostActiveTable[1]}件)`)
    }

    return insights
  }
}
