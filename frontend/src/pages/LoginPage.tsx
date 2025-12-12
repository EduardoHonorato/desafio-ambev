import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column - Login Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/37/Logo_Ambev.png"
                  alt="Logo Ambev"
                  className="h-16 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Faça login em sua conta</h1>
              <p className="text-sm text-gray-600">
                Digite seu email abaixo para fazer login em sua conta
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Cover Image */}
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://forbes.com.br/wp-content/uploads/2023/09/carreira-ambev-estagio-trainee.jpg"
          alt="Carreira Ambev - Estágio e Trainee"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Sistema de Gestão de Colaboradores
          </h2>
          <p className="text-lg text-white/90 max-w-md">
            Gerencie sua equipe de forma eficiente e profissional com nossa plataforma completa de gestão.
          </p>
        </div>
      </div>
    </div>
  );
};
