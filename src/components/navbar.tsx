"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Shield } from "lucide-react"
import AlertsDropdown from "@/components/ui/alerts-dropdown"

export default function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .substring(0, 2)
      .toUpperCase()
  }

  const getRoleBadge = (role: string) => {
    return role === "ADMIN" ? (
      <div className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
        <Shield className="h-3 w-3" />
        Admin
      </div>
    ) : (
      <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
        <User className="h-3 w-3" />
        Usuario
      </div>
    )
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src="https://sinecta.com/wp-content/uploads/2024/03/Sinecta_Logotipo-2-03-p-500-2.png" alt="Sinecta Logo" className="h-8 w-auto" />
          </div>

          <div className="flex items-center gap-4">
            {getRoleBadge(user.role)}

            {user.role === "ADMIN" && <AlertsDropdown />}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700">{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email.split('@')[0]}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
