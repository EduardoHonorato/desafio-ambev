import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import type { LoginRequest, VerifyOtpRequest } from '@/services/authService';
import { APP_CONFIG, ROUTES } from '@/config';
import { useToast } from '@/components/ui/toast';

/**
 * Hook de autenticação
 * Gerencia login, verificação OTP, logout e estado de autenticação
 * @returns {object} Objeto com funções de autenticação e estado
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  /**
   * Login de usuário
   * @param {LoginRequest} data - Email e senha do usuário
   * @type {POST} - Método utilizado
   * @returns {object} Retorna token e dados do colaborador ou redireciona para OTP
   */
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data, variables) => {
      if (data.requiresOtp) {
        navigate('/otp', { state: { email: variables.email } });
        addToast({
          type: 'info',
          title: 'Código enviado',
          description: data.message || 'Verifique seu email para o código de verificação',
          duration: 5000,
        });
      } else if (data.token && data.employee) {
        localStorage.setItem(APP_CONFIG.tokenKey, data.token);
        localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(data.employee));
        queryClient.setQueryData(['user'], data.employee);
        navigate(ROUTES.dashboard);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Usuário ou senha inválidos';
      addToast({
        type: 'error',
        title: 'Erro ao fazer login',
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  /**
   * Verificação de código OTP
   * @param {VerifyOtpRequest} data - Email e código OTP
   * @type {POST} - Método utilizado
   * @returns {object} Retorna token e dados do colaborador
   */
  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (data) => {
      if (data.token && data.employee) {
        localStorage.setItem(APP_CONFIG.tokenKey, data.token);
        localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(data.employee));
        queryClient.setQueryData(['user'], data.employee);
        navigate(ROUTES.dashboard);
        addToast({
          type: 'success',
          title: 'Login realizado',
          description: 'Bem-vindo ao sistema!',
          duration: 5000,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Código inválido ou expirado';
      addToast({
        type: 'error',
        title: 'Erro ao verificar código',
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  /**
   * Logout do usuário
   * Remove tokens e dados do usuário do localStorage
   * @returns {void}
   */
  const logout = () => {
    localStorage.removeItem(APP_CONFIG.tokenKey);
    localStorage.removeItem(APP_CONFIG.userKey);
    queryClient.clear();
    navigate(ROUTES.login);
  };

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Retorna true se houver token no localStorage
   */
  const isAuthenticated = () => {
    return !!localStorage.getItem(APP_CONFIG.tokenKey);
  };

  /**
   * Obtém dados do usuário atual
   * @returns {object|null} Retorna dados do colaborador ou null
   */
  const getCurrentUser = () => {
    const userStr = localStorage.getItem(APP_CONFIG.userKey);
    return userStr ? JSON.parse(userStr) : null;
  };

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isLoading: loginMutation.isPending || verifyOtpMutation.isPending,
    error: loginMutation.error || verifyOtpMutation.error,
    logout,
    isAuthenticated,
    getCurrentUser,
  };
};
