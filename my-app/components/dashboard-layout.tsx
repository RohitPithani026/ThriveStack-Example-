"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LayoutDashboard, ShoppingBag, LogOut, Users } from "lucide-react"
import { event } from "@/lib/gtag"

interface User {
  email: string
  name: string
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    event({
      action: "logout_click",
      category: "Navigation",
      label: "Sidebar: Logout",
    })

    localStorage.removeItem("user")
    router.push("/")
  }


  if (!user) {
    return <div>Loading...</div> 
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Sidebar: Dashboard",
    },
    {
      name: "Products",
      href: "/products",
      icon: ShoppingBag,
      label: "Sidebar: Products",
    },
    {
      name: "Account",
      href: "/account",
      icon: Users,
      label: "Sidebar: Account",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-xl">ProductHub</span>
          </Link>
        </div>

        <nav className="px-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <button
                onClick={() =>
                  event({
                    action: "sidebar_click",
                    category: "Navigation",
                    label: item.label,
                  })
                }
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            </Link>
          ))}

        </nav>

        <div className="p-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  )
}
