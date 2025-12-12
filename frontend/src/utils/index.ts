/**
 * Utility functions used across multiple pages/components
 */

/**
 * Get user initials from first and last name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
};

/**
 * Get user initials from full name string
 */
export const getInitialsFromFullName = (fullName: string): string => {
  if (!fullName) return '';
  const names = fullName.trim().split(' ').filter(name => name.length > 0);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

/**
 * Format date to Brazilian format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format date and time to Brazilian format
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate pagination values
 */
export const calculatePagination = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

/**
 * Filter array by search term (case-insensitive)
 */
export const filterBySearch = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return items;

  const searchLower = searchTerm.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchLower);
    })
  );
};

/**
 * Get status badge color class
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    Ativo: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Pendente: 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-red-100 text-red-800',
    Inativo: 'bg-red-100 text-red-800',
    Success: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
    Falhou: 'bg-red-100 text-red-800',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Check if user can manage employee based on roles
 */
export const canManageEmployee = (
  currentUserRole: string,
  targetEmployeeRole: string
): boolean => {
  if (currentUserRole === 'Director') return true;
  if (currentUserRole === 'Leader') {
    return targetEmployeeRole === 'Employee' || targetEmployeeRole === 'Leader';
  }
  return currentUserRole === 'Employee' && targetEmployeeRole === 'Employee';
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Generate array of page numbers for pagination
 */
export const generatePageNumbers = (totalPages: number): number[] => {
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

/**
 * Apply CPF mask (000.000.000-00)
 */
export const maskCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
};

/**
 * Apply CNPJ mask (00.000.000/0000-00)
 */
export const maskCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length > 11) {
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  return maskCPF(value);
};

/**
 * Apply document mask (CPF or CNPJ)
 */
export const maskDocument = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return maskCPF(value);
  }
  return maskCNPJ(value);
};

/**
 * Validate CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;

  return true;
};

/**
 * Validate CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  if (numbers.length !== 14) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;

  let length = numbers.length - 2;
  let digits = numbers.substring(0, length);
  const checkDigits = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(0))) return false;

  length = length + 1;
  digits = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(1))) return false;

  return true;
};

/**
 * Validate document (CPF or CNPJ)
 */
export const validateDocument = (document: string): boolean => {
  const numbers = document.replace(/\D/g, '');
  if (numbers.length === 11) {
    return validateCPF(document);
  } else if (numbers.length === 14) {
    return validateCNPJ(document);
  }
  return false;
};

/**
 * Apply phone mask ((00) 00000-0000 or (00) 0000-0000)
 */
export const maskPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

/**
 * Validate phone (Brazilian format)
 */
export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

/**
 * Apply date mask (DD/MM/YYYY)
 */
export const maskDate = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
};

/**
 * Validate date format and convert to YYYY-MM-DD
 */
export const validateAndFormatDate = (dateString: string): string | null => {
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31) return null;
  if (month < 1 || month > 12) return null;
  if (year < 1900 || year > new Date().getFullYear()) return null;

  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null;
  }

  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};
