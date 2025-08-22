'use client';

import QuotationForm from '../quotation-form';
import VendorQuotations from '../vendor-quotations';

interface UserViewProps {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export default function UserView({ user }: UserViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cotizador de Seguros Agrícolas</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Formulario de Nueva Cotización con mapa a la derecha */}
          <QuotationForm />

          {/* Lista de Mis Cotizaciones (siempre abajo) */}
          <VendorQuotations />
        </div>
      </div>
    </div>
  );
}
