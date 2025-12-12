import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  employee?: EmployeeDto;
  requiresOtp?: boolean;
  message?: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface EmployeeDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  birthDate: string;
  role: number | 'Employee' | 'Leader' | 'Director';
  department: string;
  positionId?: number;
  position?: string;
  managerId?: number;
  managerName?: string;
  phones: PhoneDto[];
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PhoneDto {
  id: number;
  number: string;
  type: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/verify-otp', data);
    return response.data;
  },
};

export const employeeService = {
  getAll: async (search?: string): Promise<EmployeeDto[]> => {
    const params = search ? { search } : {};
    const response = await api.get<EmployeeDto[]>('/employees', { params });
    return response.data;
  },

  getById: async (id: number): Promise<EmployeeDto> => {
    const response = await api.get<EmployeeDto>(`/employees/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeRequest): Promise<EmployeeDto> => {
    const response = await api.post<EmployeeDto>('/employees', data);
    return response.data;
  },

  update: async (id: number, data: UpdateEmployeeRequest): Promise<EmployeeDto> => {
    const response = await api.put<EmployeeDto>(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<EmployeeDto> => {
    const response = await api.put<EmployeeDto>('/employees/profile', data);
    return response.data;
  },
};

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  birthDate: string;
  password: string;
  role: 'Employee' | 'Leader' | 'Director';
  department: string;
  managerId?: number;
  phones: CreatePhoneRequest[];
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  birthDate: string;
  role: number;
  department: string;
  positionId?: number;
  managerId?: number;
  phones: UpdatePhoneRequest[];
  password?: string;
  isActive: boolean;
}

export interface CreatePhoneRequest {
  number: string;
  type: string;
}

export interface UpdatePhoneRequest {
  id?: number;
  number: string;
  type: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  birthDate: string;
  phones: CreatePhoneRequest[];
  password?: string;
}
