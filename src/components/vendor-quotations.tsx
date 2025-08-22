"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Calendar, DollarSign, MapPin } from "lucide-react"
import useQuotations from "@/hooks/use-quotation"
import { Quotation } from "@/types/quotation.types"

const getEstadoBadge = (status: string) => {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    review: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-800",
  }

  const statusLabels = {
    pending: "Pendiente",
    approved: "Aprobada", 
    rejected: "Rechazada",
    review: "En Revisión",
    expired: "Vencida"
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}`}>
      {statusLabels[status as keyof typeof statusLabels] || status}
    </span>
  )
}


export default function VendorQuotations() {
  const { quotations, isLoading } = useQuotations()
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null)

  // Filter quotations by user and status
  

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return new Intl.DateTimeFormat("es-MX").format(date)
  }

  const handleViewDetail = (quotationId: string) => {
    setSelectedQuotation(quotationId)
  }

  const handleBackToList = () => {
    setSelectedQuotation(null)
  }

  if (selectedQuotation) {
    // For now, just show a simple detail view
    const quotation = quotations.find(q => q.id === selectedQuotation)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Cotización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{quotation?.clientName}</h3>
              <p className="text-sm text-gray-600">ID: {quotation?.id}</p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Volver a la lista
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Cotizaciones</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          Mis Cotizaciones Pendientes
        </CardTitle>
        <CardDescription>
          {quotations.length} cotización{quotations.length !== 1 ? "es" : ""} pendiente
          {quotations.length !== 1 ? "s" : ""} (editables)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {quotations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tienes cotizaciones pendientes</p>
            <p className="text-sm text-gray-400 mt-1">Las cotizaciones pendientes son las únicas que puedes editar</p>
          </div>
        ) : (
          <div className="space-y-4">
                {quotations.map((quotation: Quotation) => (
              <div key={quotation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{quotation.clientName}</h3>
                    <p className="text-sm text-gray-600">ID: {quotation.id}</p>
                  </div>
                  {getEstadoBadge(quotation.status || 'pending')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>Cotización #{quotation.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>{formatCurrency(quotation.insuredAmount || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {quotation.validityStart ? formatDate(quotation.validityStart) : 'N/A'} - {quotation.validityEnd ? formatDate(quotation.validityEnd) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">ID: {quotation.id}</p>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetail(quotation.id.toString())}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
