'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/use-login';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const session = await login({ email, password });

    if (session) {
      // Store the session in localStorage
      localStorage.setItem('session', JSON.stringify(session));

      // Redirect to main page
      window.location.href = '/';
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          {/* Sinecta Logo */}
          <div className="mx-auto w-32 h-16 flex items-center justify-center">
            <img
              src="https://sinecta.com/wp-content/uploads/2024/03/Sinecta_Logotipo-2-03-p-500-2.png"
              alt="Sinecta Logo"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-800">Cotizaciones</CardTitle>
            <p className="text-sm text-gray-600">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Credenciales de prueba:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Admin:</strong> admin@example.com / Admin1234!
                </p>
                <p>
                  <strong>Usuario:</strong> user@example.com / User1234!
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
