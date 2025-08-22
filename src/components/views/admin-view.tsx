'use client';
import AdminStats from '@/components/admin-stats';
import AlertsPanel from '@/components/alerts-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, Plus, Bell } from 'lucide-react';
import QuotationForm from '../quotation-form';
import QuotationsTable from '../quotations-table';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona todas las cotizaciones del sistema</p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <AdminStats />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cotizaciones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cotizaciones" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Cotizaciones
            </TabsTrigger>
            <TabsTrigger value="nueva" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cotización
            </TabsTrigger>
            <TabsTrigger value="alertas" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="reportes" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cotizaciones">
            <QuotationsTable />
          </TabsContent>

          <TabsContent value="nueva">
            <QuotationForm />
          </TabsContent>

          <TabsContent value="alertas">
            <AlertsPanel />
          </TabsContent>

          <TabsContent value="reportes">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reportes en Desarrollo</h3>
              <p className="text-gray-500">
                Los reportes avanzados estarán disponibles próximamente
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
