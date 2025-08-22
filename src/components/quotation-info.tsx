'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Quotation } from '@/types/quotation.types';
import { Calendar, DollarSign, MapPinned, User, Leaf } from 'lucide-react';

const GeofenceMap = dynamic(() => import('@/components/geofence-map'), { ssr: false });

interface QuotationInfoProps {
  quotation: Quotation;
}

export default function QuotationInfo({ quotation }: QuotationInfoProps) {
  const cropName = quotation.crop && typeof quotation.crop === 'object' && 'name' in quotation.crop
    ? (quotation.crop as { name?: string }).name || ''
    : '';
  const stateName = quotation.state && typeof quotation.state === 'object' && 'name' in quotation.state
    ? (quotation.state as { name?: string }).name || ''
    : '';

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(
      amount ?? 0
    );

  const formatDate = (date?: Date) =>
    date ? new Date(date).toISOString().slice(0, 10) : '';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 text-blue-600" />
              Información del Cliente
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[90px_1fr] gap-2 items-center">
                <Label className="text-xs text-muted-foreground">Cliente:</Label>
                <div className="px-3 py-2 rounded-md border bg-background text-foreground text-sm">
                  {quotation.clientName}
                </div>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2 items-center">
                <Label className="text-xs text-muted-foreground">Estado:</Label>
                <div className="px-3 py-2 rounded-md border bg-background text-foreground text-sm flex items-center gap-2">
                  <MapPinned className="h-3 w-3" /> {stateName}
                </div>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2 items-center">
                <Label className="text-xs text-muted-foreground">Cultivo:</Label>
                <div className="px-3 py-2 rounded-md border bg-background text-foreground text-sm flex items-center gap-2">
                  <Leaf className="h-3 w-3" /> {cropName}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 text-green-600" />
              Información Financiera
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Monto Asegurado</Label>
              <div className="text-3xl font-extrabold text-green-600">
                {formatCurrency(quotation.insuredAmount)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-orange-600" />
              Período de Cobertura
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fecha de Inicio</Label>
                <div className="px-3 py-2 rounded-md border bg-background text-foreground text-sm">
                  {formatDate(quotation.validityStart)}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fecha de Fin</Label>
                <div className="px-3 py-2 rounded-md border bg-background text-foreground text-sm">
                  {formatDate(quotation.validityEnd)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPinned className="h-4 w-4 text-violet-600" />
              Área Asegurada
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Hectáreas Totales</Label>
              <div className="text-3xl font-extrabold text-violet-600">
                {(quotation.insuredArea ?? 0).toFixed(2)} ha
              </div>
              <div className="text-xs text-muted-foreground pt-1 border-t">Área Específica</div>
              <div className="text-sm text-foreground">
                {(quotation.insuredArea ?? 0).toFixed(2)} hectáreas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Label>Área asegurada (solo lectura)</Label>
        <GeofenceMap
          initialGeofence={
            (quotation.geofence as unknown as {
              type: string;
              properties: Record<string, unknown>;
              geometry: Record<string, unknown>;
            }) ?? undefined
          }
          readOnly
        />
      </div>
    </div>
  );
}


