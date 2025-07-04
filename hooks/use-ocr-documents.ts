"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export interface OcrDocument {
  id: string
  project_id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  page_count?: number
  processing_status: "uploaded" | "processing" | "completed" | "failed"
  ocr_result?: any
  confidence_score?: number
  processing_started_at?: string
  processing_completed_at?: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

export function useOcrDocuments(projectId?: string) {
  const [documents, setDocuments] = useState<OcrDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from("ocr_documents").select("*").order("created_at", { ascending: false })

      if (projectId) {
        query = query.eq("project_id", projectId)
      }

      const { data, error } = await query

      if (error) throw error

      setDocuments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "文書の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (projectId: string, file: File, onProgress?: (progress: number) => void) => {
    if (!user) throw new Error("ログインが必要です")

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `ocr-documents/${projectId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(filePath, file)

    if (uploadError) throw uploadError

    // Create document record
    const { data, error } = await supabase
      .from("ocr_documents")
      .insert([
        {
          project_id: projectId,
          filename: fileName,
          original_filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    await fetchDocuments()
    return data
  }

  const updateDocument = async (id: string, updates: Partial<OcrDocument>) => {
    const { data, error } = await supabase
      .from("ocr_documents")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await fetchDocuments()
    return data
  }

  const deleteDocument = async (id: string) => {
    // Get document info first
    const { data: document } = await supabase.from("ocr_documents").select("file_path").eq("id", id).single()

    if (document) {
      // Delete file from storage
      await supabase.storage.from("documents").remove([document.file_path])
    }

    // Delete document record
    const { error } = await supabase.from("ocr_documents").delete().eq("id", id)

    if (error) throw error

    await fetchDocuments()
  }

  const getDocument = async (id: string) => {
    const { data, error } = await supabase.from("ocr_documents").select("*").eq("id", id).single()

    if (error) throw error

    return data
  }

  useEffect(() => {
    fetchDocuments()
  }, [projectId])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  }
}
