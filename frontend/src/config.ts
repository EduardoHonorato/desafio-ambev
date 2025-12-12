// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3006/api',
  timeout: 10000,
} as const;

// Application Configuration
export const APP_CONFIG = {
  name: 'Employee Management',
  version: '1.0.0',
  itemsPerPage: 10,
  tokenKey: 'token',
  userKey: 'user',
} as const;

// Routes Configuration
export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  employees: '/employees',
  employeesCreate: '/employees/create',
  employeesEdit: (id: number) => `/employees/edit/${id}`,
  departments: '/departments',
  departmentsCreate: '/departments/create',
  departmentsEdit: (id: number) => `/departments/edit/${id}`,
  positions: '/positions',
  positionsCreate: '/positions/create',
  positionsEdit: (id: number) => `/positions/edit/${id}`,
} as const;

// Employee Roles
export const EMPLOYEE_ROLES = {
  Employee: 'Employee',
  Leader: 'Leader',
  Director: 'Director',
} as const;

export type EmployeeRole = typeof EMPLOYEE_ROLES[keyof typeof EMPLOYEE_ROLES];

// Employee Role Labels
export const EMPLOYEE_ROLE_LABELS: Record<string, string> = {
  Employee: 'Colaborador',
  Leader: 'Líder',
  Director: 'Diretor',
};

// Employee Role Labels by Number
export const EMPLOYEE_ROLE_LABELS_BY_ID: Record<number, string> = {
  1: 'Colaborador',
  2: 'Líder',
  3: 'Diretor',
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_CONFIG.baseURL}/auth/login`,
  },
  employees: `${API_CONFIG.baseURL}/employees`,
  departments: `${API_CONFIG.baseURL}/departments`,
  positions: `${API_CONFIG.baseURL}/positions`,
} as const;
