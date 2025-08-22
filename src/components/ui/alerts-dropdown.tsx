'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Clock } from 'lucide-react';

type Alert = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  createdAt: Date;
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Info className="h-4 w-4 text-blue-600" />;
  }
};

const getAlertBgColor = (type: string, read: boolean) => {
  if (read) return 'bg-gray-50';

  switch (type) {
    case 'success':
      return 'bg-green-50 border-l-4 border-green-400';
    case 'warning':
      return 'bg-yellow-50 border-l-4 border-yellow-400';
    case 'error':
      return 'bg-red-50 border-l-4 border-red-400';
    default:
      return 'bg-blue-50 border-l-4 border-blue-400';
  }
};

export default function AlertsDropdown() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4001');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          type?: string;
          timestamp?: string;
          quotationId?: string | number;
          clientName?: string;
          insuredArea?: number;
          insuredAmount?: number;
          crop?: string;
          state?: string;
          text?: string;
          message?: string;
        };

        const createdAt = data.timestamp ? new Date(data.timestamp) : new Date();
        const baseMessage = data.message || data.text || 'Nueva notificación';

        if (data.type === 'HIGH_AREA_ALERT') {
          const newAlert: Alert = {
            id: `${data.quotationId ?? ''}-${createdAt.getTime()}`,
            title: `Alta área asegurada${data.clientName ? `: ${data.clientName}` : ''}`,
            message: baseMessage,
            type: 'warning',
            read: false,
            createdAt,
          };
          setAlerts((prev) => [newAlert, ...prev]);
          return;
        }

        // Fallback to info for unknown types
        const infoAlert: Alert = {
          id: `${createdAt.getTime()}`,
          title: 'Notificación',
          message: baseMessage,
          type: 'info',
          read: false,
          createdAt,
        };
        setAlerts((prev) => [infoAlert, ...prev]);
      } catch (e) {
        // Ignore malformed messages
      }
    };

    return () => ws.close();
  }, []);

  // useEffect(() => {
  //   loadAlerts()
  // }, [])

  // const loadAlerts = () => {
  //   setLoading(true)
  //   // Simulate API delay
  //   setTimeout(() => {
  //     const allAlerts = [...mockAlerts]
  //     setAlerts(allAlerts.sort((a: Alert, b: Alert) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  //     setLoading(false)
  //   }, 300)
  // }

  const handleMarkAsRead = (alertId: string) => {
    // Update local state to mark alert as read
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert))
    );
  };

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alertas</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} nuevas
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No hay alertas</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {alerts.slice(0, 10).map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className={`p-3 cursor-pointer ${getAlertBgColor(alert.type, alert.read)}`}
                  onClick={() => !alert.read && handleMarkAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p
                          className={`text-sm font-medium truncate ${alert.read ? 'text-gray-600' : 'text-gray-900'}`}
                        >
                          {alert.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(alert.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-xs truncate ${alert.read ? 'text-gray-500' : 'text-gray-700'}`}
                      >
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}

        {alerts.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-gray-500 cursor-pointer">
              Ver todas las alertas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
