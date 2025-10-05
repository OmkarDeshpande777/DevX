"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Home, 
  Leaf, 
  TrendingUp, 
  HelpCircle,
  ChevronUp,
  User,
  Activity,
  Calendar,
  TestTube,
  DollarSign,
  Stethoscope
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Crop Recommendation",
    icon: Leaf,
    url: "/crop-recommendation",
  },
  {
    title: "Agri Doctor",
    icon: Stethoscope,
    url: "/agri-doctor",
  },
  {
    title: "Soil Analysis",
    icon: TestTube,
    url: "/soil-analysis",
  },
  {
    title: "Farming Calendar",
    icon: Calendar,
    url: "/crop-calendar",
  },
  {
    title: "Live Prices",
    icon: TrendingUp,
    url: "/live-prices",
  },
  {
    title: "Crop Health Map",
    icon: Activity,
    url: "/healthmap",
  },
  {
    title: "Farm Finance",
    icon: DollarSign,
    url: "/farm-finance",
  },
]

const supportItems = [
  {
    title: "Ask AI",
    icon: HelpCircle,
    url: "/help",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" className="border-r border-emerald-200 bg-gradient-to-b from-emerald-50 to-green-50">
      <SidebarHeader className="border-b border-emerald-200 bg-white/80">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-emerald-800 text-lg">CropAI</span>
            <span className="truncate text-xs text-emerald-600">Smart Farming Platform</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-gradient-to-b from-white to-emerald-50/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-700 font-semibold">Main Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="hover:bg-emerald-100 hover:text-emerald-800 data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-500 data-[active=true]:to-green-600 data-[active=true]:text-white data-[active=true]:shadow-lg transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-700 font-semibold">Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="hover:bg-emerald-100 hover:text-emerald-800 data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-500 data-[active=true]:to-green-600 data-[active=true]:text-white data-[active=true]:shadow-lg transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="bg-white/80 border-t border-emerald-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-emerald-100 data-[state=open]:text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
                >
                  <Avatar className="h-8 w-8 rounded-lg border-2 border-emerald-300">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white font-semibold">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-emerald-800">CropAI User</span>
                    <span className="truncate text-xs text-emerald-600">farmer@example.com</span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-emerald-600" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-emerald-200"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-800">Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}