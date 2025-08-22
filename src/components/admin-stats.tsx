'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, Clock, DollarSign, Users, AlertTriangle } from 'lucide-react';
import useQuotations from '@/hooks/use-quotation';
import type { Quotation } from '@/types/quotation.types';

export default function AdminStats() {
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    enRevision: 0,
    montoTotal: 0,
    superficieTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const { quotations, isLoading } = useQuotations({ page: 0, pageSize: 100 });

  useEffect(() => {
    if (!isLoading) {
      const list: Quotation[] = quotations || [];
      const newStats = {
        total: list.length,
        pendientes: list.filter((q) => q.status === 'pending').length,
        aprobadas: list.filter((q) => q.status === 'approved').length,
        rechazadas: list.filter((q) => q.status === 'rejected').length,
        enRevision: list.filter((q) => q.status === 'review').length,
        montoTotal: list.reduce((sum, q) => sum + (q.insuredAmount || 0), 0),
        superficieTotal: list.reduce((sum, q) => sum + (q.insuredArea || 0), 0),
      };
      setStats(newStats);
      setLoading(false);
    }
  }, [isLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Todas las cotizaciones</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
          <p className="text-xs text-muted-foreground">Requieren atención</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
          <AlertTriangle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.enRevision}</div>
          <p className="text-xs text-muted-foreground">En proceso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.aprobadas}</div>
          <p className="text-xs text-muted-foreground">Activas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
          <Users className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.rechazadas}</div>
          <p className="text-xs text-muted-foreground">No aprobadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.montoTotal)}</div>
          <p className="text-xs text-muted-foreground">Valor asegurado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Superficie Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.superficieTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Hectáreas aseguradas</p>
        </CardContent>
      </Card>
    </div>
  );
}
