import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { ROUTES, API_CONFIG } from '@/config';

export const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, isLoading } = useAuth();
  const { addToast } = useToast();
  
  const email = (location.state as { email?: string })?.email || '';
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.login);
    } else {
      // Auto-focus no primeiro campo
      inputRefs.current[0]?.focus();
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newCodes = pastedData.split('');
      setCodes(newCodes);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codes.join('');
    
    if (code.length !== 6) {
      addToast({
        type: 'error',
        title: 'Código inválido',
        description: 'Por favor, digite o código de 6 dígitos',
        duration: 5000,
      });
      return;
    }

    try {
      await verifyOtp({ email, code });
    } catch (error: any) {
      // Erro já tratado no hook
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Código reenviado',
          description: 'Um novo código foi enviado para seu email',
          duration: 5000,
        });
        // Limpar campos
        setCodes(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        const data = await response.json();
        addToast({
          type: 'error',
          title: 'Erro ao reenviar',
          description: data.message || 'Não foi possível reenviar o código',
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao reenviar',
        description: 'Não foi possível reenviar o código',
        duration: 5000,
      });
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column - OTP Form */}
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
              <h1 className="text-2xl font-bold text-gray-900">Digite o código de verificação</h1>
              <p className="text-sm text-gray-600">
                Enviamos um código de 6 dígitos para seu email.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 text-center block">
                  Digite o código de 6 dígitos enviado para seu email.
                </Label>
                <div className="flex justify-center items-center gap-2">
                  {codes.map((code, index) => (
                    <div key={index} className="flex items-center">
                      <Input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={code}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-lg font-semibold bg-white"
                        required
                      />
                      {index === 2 && (
                        <span className="mx-2 text-gray-400 text-xl font-semibold">-</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                disabled={isLoading || codes.some(c => !c)}
              >
                {isLoading ? 'Verificando...' : 'Verificar'}
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Não recebeu o código?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    Reenviar
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Cover Image */}
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <img
          src="https://forbes.com.br/wp-content/uploads/2023/09/carreira-ambev-estagio-trainee.jpg"
          alt="Carreira Ambev - Estágio e Trainee"
          className="absolute inset-0 min-h-full w-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white z-10">
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

