"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useOcrProjects } from "@/hooks/use-ocr-projects"

const projectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です"),
  description: z.string().optional(),
  paper_width_mm: z.number().min(1, "用紙幅は1mm以上である必要があります").optional(),
  paper_height_mm: z.number().min(1, "用紙高さは1mm以上である必要があります").optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  mode?: "create" | "edit"
}

export function ProjectForm({ initialData, mode = "create" }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProject } = useOcrProjects()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true)
      await createProject(data)
      reset()
      router.push("/ocr-projects")
    } catch (error) {
      alert(error instanceof Error ? error.message : "プロジェクトの作成に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">プロジェクト名 *</Label>
          <Input id="name" {...register("name")} placeholder="例: 吾輩は猫である 初版復刻" />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="プロジェクトの詳細説明を入力してください"
            rows={3}
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paper_width_mm">用紙幅 (mm)</Label>
            <Input
              id="paper_width_mm"
              type="number"
              step="0.1"
              {...register("paper_width_mm", { valueAsNumber: true })}
              placeholder="188.0"
            />
            {errors.paper_width_mm && <p className="text-sm text-red-600 mt-1">{errors.paper_width_mm.message}</p>}
          </div>

          <div>
            <Label htmlFor="paper_height_mm">用紙高さ (mm)</Label>
            <Input
              id="paper_height_mm"
              type="number"
              step="0.1"
              {...register("paper_height_mm", { valueAsNumber: true })}
              placeholder="257.0"
            />
            {errors.paper_height_mm && <p className="text-sm text-red-600 mt-1">{errors.paper_height_mm.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          リセット
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "作成中..." : mode === "create" ? "プロジェクト作成" : "更新"}
        </Button>
      </div>
    </form>
  )
}
