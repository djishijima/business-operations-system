"use client"

import { useState } from "react"
import { Search, Filter, Sparkles, BarChart3, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchService, type SearchResult, type SearchStats } from "@/lib/search-service"
import { useToast } from "@/hooks/use-toast"

const tableOptions = [
  { value: "leads", label: "リード", color: "bg-green-100 text-green-800" },
  { value: "tasks", label: "タスク", color: "bg-blue-100 text-blue-800" },
  { value: "approvals", label: "承認申請", color: "bg-purple-100 text-purple-800" },
  { value: "users", label: "ユーザー", color: "bg-orange-100 text-orange-800" },
  { value: "payment_recipients", label: "支払先", color: "bg-cyan-100 text-cyan-800" },
  { value: "application_codes", label: "コード", color: "bg-gray-100 text-gray-800" },
]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [stats, setStats] = useState<SearchStats | null>(null)
  const [aiSummary, setAiSummary] = useState<string>("")
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState<"fulltext" | "ai">("fulltext")
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "検索クエリが空です",
        description: "検索キーワードを入力してください",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      if (searchType === "ai") {
        const aiResults = await SearchService.aiSearch(query, {
          summarize: true,
          maxResults: 20,
        })
        setResults(aiResults.results)
        setAiSummary(aiResults.summary || "")
        setInsights(aiResults.insights || [])
        setStats({
          total_results: aiResults.results.length,
          search_time_ms: 0,
          tables_searched: selectedTables.length > 0 ? selectedTables : ["all"],
        })
      } else {
        const searchResults = await SearchService.fullTextSearch({
          query,
          tables: selectedTables.length > 0 ? selectedTables : undefined,
          limit: 50,
          sortBy: "relevance",
        })
        setResults(searchResults.results)
        setStats(searchResults.stats)
        setAiSummary("")
        setInsights([])
      }

      toast({
        title: "検索完了",
        description: `${results.length}件の結果が見つかりました`,
      })
    } catch (error) {
      toast({
        title: "検索エラー",
        description: "検索中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTableToggle = (table: string, checked: boolean) => {
    if (checked) {
      setSelectedTables([...selectedTables, table])
    } else {
      setSelectedTables(selectedTables.filter((t) => t !== table))
    }
  }

  const getTableColor = (tableName: string) => {
    const option = tableOptions.find((opt) => opt.value === tableName)
    return option?.color || "bg-gray-100 text-gray-800"
  }

  const getTableLabel = (tableName: string) => {
    const option = tableOptions.find((opt) => opt.value === tableName)
    return option?.label || tableName
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">統合検索</h1>
        <p className="text-muted-foreground">全モジュールを横断してデータを検索・分析します</p>
      </div>

      {/* 検索フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            検索
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="検索キーワードを入力..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="text-lg"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} size="lg">
              {loading ? "検索中..." : "検索"}
            </Button>
          </div>

          <Tabs value={searchType} onValueChange={(value: any) => setSearchType(value)}>
            <TabsList>
              <TabsTrigger value="fulltext">全文検索</TabsTrigger>
              <TabsTrigger value="ai">AI検索・要約</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* テーブルフィルター */}
          <div>
            <Label className="text-sm font-medium">検索対象</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {tableOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedTables.includes(option.value)}
                    onCheckedChange={(checked) => handleTableToggle(option.value, checked as boolean)}
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    <Badge className={option.color}>{option.label}</Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 検索統計 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">検索結果</span>
              </div>
              <div className="text-2xl font-bold">{stats.total_results}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">検索時間</span>
              </div>
              <div className="text-2xl font-bold">{stats.search_time_ms}ms</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">対象テーブル</span>
              </div>
              <div className="text-2xl font-bold">{stats.tables_searched.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">関連度</span>
              </div>
              <div className="text-2xl font-bold">
                {results.length > 0 ? Math.round((results[0]?.relevance_score || 0) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI要約・インサイト */}
      {(aiSummary || insights.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI要約
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={aiSummary} readOnly className="resize-none" />
              </CardContent>
            </Card>
          )}
          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  インサイト
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <li key={index} className="text-sm">
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
