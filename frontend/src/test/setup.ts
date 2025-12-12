import '@testing-library/jest-dom'
import React from 'react'

// Mock do React Query
import { QueryClient } from '@tanstack/react-query'

// Mock global para testes
global.QueryClient = QueryClient

// Mock do React Router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
    Link: ({ children, to, ...props }: any) => {
      return React.createElement('a', { href: to, ...props }, children);
    },
  }
})

// Mock do toast
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}))

// Mock do auth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { role: 'Director', id: 1, name: 'Test User' },
    isAuthenticated: true,
  }),
}))

// Mock das funções de utilitários
vi.mock('@/utils', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
  maskDocument: (doc: string) => doc,
  validateDocument: () => true,
  maskPhone: (phone: string) => phone,
  validatePhone: () => true,
  maskDate: (date: string) => date,
  validateDate: () => true,
  validateEmail: () => true,
  EMPLOYEE_ROLE_OPTIONS: [
    { value: 'Employee', label: 'Colaborador' },
    { value: 'Leader', label: 'Líder' },
    { value: 'Director', label: 'Diretor' }
  ]
}))

// Mock do config
vi.mock('@/config', () => ({
  ROUTES: {
    dashboard: '/dashboard',
    employees: '/employees',
    departments: '/departments',
    positions: '/positions',
  },
  EMPLOYEE_ROLE_LABELS: {
    Employee: 'Colaborador',
    Leader: 'Líder',
    Director: 'Diretor',
  },
  EMPLOYEE_ROLE_LABELS_BY_ID: {
    1: 'Colaborador',
    2: 'Líder',
    3: 'Diretor',
  }
}))