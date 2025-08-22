"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Clock, Check } from "lucide-react"

import type { Alert } from "@/types"

const getAlertIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    case "error":
      return <XCircle className="h-5 w-5 text-red-600" />
    default:
      return <Info className="h-5 w-5 text-blue-600" />
  }
}

const getAlertBgColor = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200"
    case "warning":
      return "bg-yellow-50 border-yellow-200"
    case "error":
      return "bg-red-50 border-red-200"
    default:
      return "bg-blue-50 border-blue-200"
  }
}

// Simple localStorage-backed store for demo/testing
const STORAGE_KEY = "alerts"

function getAlerts(): Alert[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Array<Omit<Alert, "createdAt"> & { createdAt: string | Date }>
    return parsed.map((a) => ({ ...a, createdAt: new Date(a.createdAt) })) as Alert[]
  } catch {
    return []
  }
}

function setAlerts(next: Alert[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function addAlert(input: { title: string; message: string; type: Alert["type"]; read?: boolean }) {
  const alerts = getAlerts()
  const newAlert: Alert = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: input.title,
    message: input.message,
    type: input.type,
    read: input.read ?? false,
    createdAt: new Date(),
  }
  setAlerts([newAlert, ...alerts])
}

function markAlertAsRead(alertId: string) {
  const alerts = getAlerts()
  const next = alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a))
  setAlerts(next)
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = () => {
    setLoading(true)
    const allAlerts = getAlerts()
    setAlerts(allAlerts.sort((a: Alert, b: Alert) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setLoading(false)
  }

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId)
    loadAlerts()
  }

  const handleMarkAllAsRead = () => {
    alerts
      .filter((alert) => !alert.read)
      .forEach((alert) => {
        markAlertAsRead(alert.id)
      })
    loadAlerts()
  }

  const createTestAlert = (_type?: Alert["type"]) => {
    const messages = {
      info: { title: "Información del sistema", message: "El sistema se actualizará esta noche" },
      success: { title: "Cotización aprobada", message: "Nueva cotización ha sido aprobada exitosamente" },
      warning: { title: "Cotización pendiente", message: "Hay cotizaciones que requieren revisión" },
      error: { title: "Error en el sistema", message: "Se detectó un problema que requiere atención" },
    } as const

    ;(["info", "success", "warning", "error"] as const).forEach((type) => {
      const payload = messages[type]
      addAlert({
        ...payload,
        type,
        read: false,
      })
    })

    loadAlerts()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "unread") return !alert.read
    if (activeTab === "read") return alert.read
    return true
  })

  const unreadCount = alerts.filter((alert) => !alert.read).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Centro de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              Centro de Alertas
            </CardTitle>
            <CardDescription>
              {alerts.length} alertas totales, {unreadCount} sin leer
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas ({alerts.length})</TabsTrigger>
            <TabsTrigger value="unread">Sin leer ({unreadCount})</TabsTrigger>
            <TabsTrigger value="read">Leídas ({alerts.length - unreadCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Botones de prueba para desarrollo */}
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mr-4">Crear las 4 alertas de prueba:</p>
              <Button size="sm" variant="outline" onClick={() => createTestAlert()}>
                Crear 4 alertas
              </Button>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "unread"
                    ? "No hay alertas sin leer"
                    : activeTab === "read"
                      ? "No hay alertas leídas"
                      : "No hay alertas"}
                </h3>
                <p className="text-gray-500">
                  {activeTab === "all" && "Las alertas aparecerán aquí cuando se generen"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border transition-colors ${getAlertBgColor(alert.type)} ${
                      alert.read ? "opacity-75" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${alert.read ? "text-gray-600" : "text-gray-900"}`}>
                              {alert.title}
                            </h4>
                            {!alert.read && (
                              <Badge variant="secondary" className="text-xs">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm mb-2 ${alert.read ? "text-gray-500" : "text-gray-700"}`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(alert.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!alert.read && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(alert.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
