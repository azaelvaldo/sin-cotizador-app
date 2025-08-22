'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import useCrops from '@/hooks/use-crop';
import useStates from '@/hooks/use-state';
import useQuotations from '@/hooks/use-quotation';
import useDebounce from '@/hooks/use-debounce';
import { CreateQuotationInput, Quotation } from '@/types/quotation.types';
import { Crop } from '@/types/crop.types';
import { State } from '@/types/state.types';
import dynamic from 'next/dynamic';
//import GeofenceMap from "@/components/geofence-map"

const GeofenceMap = dynamic(() => import('@/components/geofence-map'), { ssr: false });

export default function QuotationForm() {
  const { createQuotation, createLoading } = useQuotations();
  const [cropSearch, setCropSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const debouncedCropSearch = useDebounce(cropSearch, 500);
  const debouncedStateSearch = useDebounce(stateSearch, 500);
  const { data: crops, isLoading: cropsLoading } = useCrops({
    sortDirection: 'asc',
    page: 0,
    pageSize: 5,
    search: debouncedCropSearch || undefined,
  });
  const { data: states, isLoading: statesLoading } = useStates({
    sortDirection: 'asc',
    page: 0,
    pageSize: 5,
    search: debouncedStateSearch || undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<{
    clientName: string;
    cropId: number;
    stateId: number;
    insuredArea: string;
    insuredAmount: string;
    validityStart: string;
    validityEnd: string;
    geofence: Record<string, unknown> | undefined;
  }>({
    clientName: '',
    cropId: 0,
    stateId: 0,
    insuredArea: '',
    insuredAmount: '',
    validityStart: '',
    validityEnd: '',
    geofence: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (
      !formData.clientName ||
      !formData.cropId ||
      !formData.stateId ||
      !formData.insuredArea ||
      !formData.insuredAmount ||
      !formData.validityStart ||
      !formData.validityEnd
    ) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    const area = Number.parseFloat(formData.insuredArea);
    const monto = Number.parseFloat(formData.insuredAmount);

    if (isNaN(area) || area <= 0) {
      setError('El área asegurada debe ser un número mayor a 0');
      return;
    }

    if (isNaN(monto) || monto <= 0) {
      setError('El monto asegurado debe ser un número mayor a 0');
      return;
    }

    const fechaInicio = new Date(formData.validityStart);
    const fechaFin = new Date(formData.validityEnd);

    if (fechaFin <= fechaInicio) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setIsSubmitting(true);

    try {
      const quotationData: CreateQuotationInput = {
        clientName: formData.clientName,
        cropId: formData.cropId,
        stateId: formData.stateId,
        insuredArea: area,
        insuredAmount: monto,
        validityStart: fechaInicio.toISOString(),
        validityEnd: fechaFin.toISOString(),
        geofence: formData.geofence,
      };

      createQuotation(quotationData);

      setSuccess(true);
      setFormData({
        clientName: '',
        cropId: 0,
        stateId: 0,
        insuredArea: '',
        insuredAmount: '',
        validityStart: '',
        validityEnd: '',
        geofence: undefined,
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Error al guardar la cotización. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Nueva Cotización</CardTitle>
        <CardDescription>
          Complete el formulario para crear una nueva cotización de seguro agrícola
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre del Cliente *</Label>
                  <Input
                    id="clientName"
                    placeholder="Ej: Estancia San Miguel"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, clientName: e.target.value }))
                    }
                    disabled={isSubmitting || createLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropId">Cultivo *</Label>
                  <Select
                    value={formData.cropId.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, cropId: parseInt(value) }))
                    }
                    disabled={isSubmitting || createLoading || cropsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un cultivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar cultivo..."
                          value={cropSearch}
                          onChange={(e) => setCropSearch(e.target.value)}
                          disabled={cropsLoading}
                        />
                      </div>
                      {crops?.data?.map((crop: Crop) => (
                        <SelectItem key={crop.id} value={crop.id.toString()}>
                          {crop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stateId">Estado (República Mexicana) *</Label>
                  <Select
                    value={formData.stateId.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, stateId: parseInt(value) }))
                    }
                    disabled={isSubmitting || createLoading || statesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar estado..."
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          disabled={statesLoading}
                        />
                      </div>
                      {states?.data?.map((state: State) => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuredArea">Área Asegurada (hectáreas) *</Label>
                  <Input
                    id="insuredArea"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.insuredArea}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, insuredArea: e.target.value }))
                    }
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuredAmount">Monto Asegurado ($) *</Label>
                  <Input
                    id="insuredAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="75000.00"
                    value={formData.insuredAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, insuredAmount: e.target.value }))
                    }
                    disabled={isSubmitting || createLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityStart">Fecha de Inicio *</Label>
                  <Input
                    id="validityStart"
                    type="date"
                    value={formData.validityStart}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, validityStart: e.target.value }))
                    }
                    disabled={isSubmitting || createLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityEnd">Fecha de Fin *</Label>
                  <Input
                    id="validityEnd"
                    type="date"
                    value={formData.validityEnd}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, validityEnd: e.target.value }))
                    }
                    disabled={isSubmitting || createLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 lg:pl-2">
              <Label>Área del Terreno (Mapa Interactivo)</Label>
              <GeofenceMap
                onGeofenceChange={(geofence, area) => {
                  setFormData((prev) => ({
                    ...prev,
                    geofence,
                    insuredArea: area > 0 ? area.toFixed(2) : '',
                  }));
                }}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Cotización creada exitosamente
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting || createLoading}>
            {isSubmitting || createLoading ? 'Guardando...' : 'Crear Cotización'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
