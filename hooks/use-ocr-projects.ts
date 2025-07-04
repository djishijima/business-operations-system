"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export interface OcrProject {
  id: string
  name: string
  description?: string
  status: "active" | "completed" | "paused" | "cancelled"
  paper_width_mm?: number
  paper_height_mm?: number
  created_by: string
  created_at: string
  updated_at: string
}

export function useOcrProjects() {
  const [projects, setProjects] = useState<OcrProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("ocr_projects").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setProjects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "プロジェクトの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<OcrProject, "id" | "created_by" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("ログインが必要です")

    const { data, error } = await supabase
      .from("ocr_projects")
      .insert([
        {
          ...projectData,
          created_by: user.id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Also create a corresponding project in the main projects table
    await supabase.from("projects").insert([
      {
        project_name: projectData.name,
        description: projectData.description,
        type: "ocr",
        status: "active",
        created_by: user.id,
      },
    ])

    await fetchProjects()
    return data
  }

  const updateProject = async (id: string, updates: Partial<OcrProject>) => {
    const { data, error } = await supabase
      .from("ocr_projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await fetchProjects()
    return data
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("ocr_projects").delete().eq("id", id)

    if (error) throw error

    await fetchProjects()
  }

  const getProject = async (id: string) => {
    const { data, error } = await supabase.from("ocr_projects").select("*").eq("id", id).single()

    if (error) throw error

    return data
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  }
}
