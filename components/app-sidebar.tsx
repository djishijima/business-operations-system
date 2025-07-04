"use client"

import type React from "react"

import {
  Bot,
  Frame,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  FileText,
  Users,
  CreditCard,
  CheckSquare,
  Search,
  Shield,
  FolderOpen,
  Scan,
  Calendar,
  Home,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const data = {
  user: {
    name: "業務管理ユーザー",
    email: "user@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  teams: [
    {
      name: "株式会社サンプル",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "ダッシュボード",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [],
    },
    {
      title: "業務管理",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "日報管理",
          url: "/daily-reports",
          icon: Calendar,
        },
        {
          title: "タスク管理",
          url: "/tasks",
          icon: CheckSquare,
        },
        {
          title: "承認管理",
          url: "/approvals",
          icon: Shield,
        },
        {
          title: "プロジェクト管理",
          url: "/projects",
          icon: FileText,
        },
      ],
    },
    {
      title: "マスタ管理",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "ユーザー管理",
          url: "/users",
          icon: Users,
        },
        {
          title: "支払先管理",
          url: "/payment-recipients",
          icon: CreditCard,
        },
        {
          title: "申請コード管理",
          url: "/application-codes",
          icon: FileText,
        },
      ],
    },
    {
      title: "OCR・組版システム",
      url: "#",
      icon: Scan,
      items: [
        {
          title: "OCRプロジェクト",
          url: "/ocr/projects",
          icon: FolderOpen,
        },
      ],
    },
    {
      title: "システム",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "ファイル管理",
          url: "/nextcloud",
          icon: FolderOpen,
        },
        {
          title: "検索",
          url: "/search",
          icon: Search,
        },
        {
          title: "管理者機能",
          url: "/admin",
          icon: Shield,
        },
      ],
    },
  ],
  projects: [
    {
      name: "サンプルプロジェクト",
      url: "/projects",
      icon: Frame,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
