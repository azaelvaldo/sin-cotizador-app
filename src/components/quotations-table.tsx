"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useQuotations from "@/hooks/use-quotation"
import useCrops from "@/hooks/use-crop"
import useStates from "@/hooks/use-state"
import type { QuotationFilters } from "@/types/quotation.types"

const ITEMS_PER_PAGE = 10

const getStatusBadge = (status: string) => {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    review: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-800",
  }

  const labels = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
    review: "En Revisión",
    expired: "Vencida",
  }

  return (
    <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
      {labels[status as keyof typeof labels] || status}
    </Badge>
  )
}

export default function QuotationsTable() {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | QuotationFilters["status"]>("all")
  const [filterCropId, setFilterCropId] = useState<"all" | number>("all")
  const [filterStateId, setFilterStateId] = useState<"all" | number>("all")

  const { data: cropsData } = useCrops({ page: 0, pageSize: 100 })
  const { data: statesData } = useStates({ page: 0, pageSize: 100 })

  const filters = useMemo<QuotationFilters>(() => ({
    search: searchTerm || undefined,
    cropId: filterCropId !== "all" ? Number(filterCropId) : undefined,
    stateId: filterStateId !== "all" ? Number(filterStateId) : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  }), [searchTerm, filterCropId, filterStateId, filterStatus, currentPage])

  const { quotations, isLoading, total, totalPages, page, pageSize } = useQuotations(filters)

  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm, filterCropId, filterStateId, filterStatus])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return new Intl.DateTimeFormat("es-MX").format(date)
  }

  const exportToCSV = () => {
    const headers = [
      "Cliente",
      "Cultivo",
      "Status",
      "Estado",
      "Superficie (ha)",
      "Monto Asegurado",
      "Vigencia Inicio",
      "Vigencia Fin",
      "Fecha Creación",
    ]

    const csvContent = [
      headers.join(","),
      ...quotations.map((q) =>
        [
          `"${q.clientName}"`,
          q.crop && typeof q.crop === 'object' && 'name' in q.crop ? (q.crop as { name?: string }).name || "" : "",
          q.status,
          q.state && typeof q.state === 'object' && 'name' in q.state ? (q.state as { name?: string }).name || "" : "",
          q.insuredArea,
          q.insuredAmount,
          q.validityStart ? formatDate(q.validityStart) : "",
          q.validityEnd ? formatDate(q.validityEnd) : "",
          q.createdAt ? formatDate(q.createdAt) : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cotizaciones_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    // Simulación de exportación a PDF
    alert("Funcionalidad de exportación a PDF en desarrollo")
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterCropId("all")
    setFilterStateId("all")
    setCurrentPage(1)
  }

  const handleViewDetail = (quotationId: string) => {
    // TODO: navigate to detail view when available
    console.log("view quotation", quotationId)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todas las Cotizaciones</CardTitle>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Todas las Cotizaciones</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {quotations.length} de {total} cotizaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cliente, cultivo o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status de Cotización</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los status</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="review">En Revisión</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cultivo</Label>
              <Select value={String(filterCropId)} onValueChange={(v) => setFilterCropId(v === 'all' ? 'all' : Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cultivos</SelectItem>
                  {(cropsData?.data || []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado (México)</Label>
              <Select value={String(filterStateId)} onValueChange={(v) => setFilterStateId(v === 'all' ? 'all' : Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {(statesData?.data || []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={resetFilters} className="w-full bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Cultivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estado (MX)</TableHead>
                  <TableHead className="text-right">Superficie</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron cotizaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  quotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">{quotation.clientName}</TableCell>
                      <TableCell>{quotation.crop && typeof quotation.crop === 'object' && 'name' in quotation.crop ? (quotation.crop as { name?: string }).name || '-' : '-'}</TableCell>
                      <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                      <TableCell className="text-sm">{quotation.state && typeof quotation.state === 'object' && 'name' in quotation.state ? (quotation.state as { name?: string }).name || '-' : '-'}</TableCell>
                      <TableCell className="text-right">{quotation.insuredArea} ha</TableCell>
                      <TableCell className="text-right">{formatCurrency(quotation.insuredAmount)}</TableCell>
                      <TableCell className="text-sm">
                        {quotation.validityStart ? formatDate(quotation.validityStart) : "N/A"} - {quotation.validityEnd ? formatDate(quotation.validityEnd) : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">{quotation.createdAt ? formatDate(quotation.createdAt) : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(quotation.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total} resultados
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail modal removed until implemented */}
    </>
  )
}
