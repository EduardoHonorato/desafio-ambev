import { useState } from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Pagination } from './pagination';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';

export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  render?: (item: T, index: number) => ReactNode;
  searchable?: boolean;
}

interface DataTableProps<T = any> {
  title: string;
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  actions?: ReactNode;
  filters?: ReactNode;
  onSearchChange?: (search: string) => void;
}

export const DataTable = <T extends Record<string, any>>({
  title,
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  searchPlaceholder = 'Buscar...',
  searchable = true,
  pagination,
  actions,
  filters,
  onSearchChange
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setAppliedSearch(searchTerm);
      if (onSearchChange) {
        onSearchChange(searchTerm);
      }
      if (pagination) {
        pagination.onPageChange(1);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setAppliedSearch('');
    if (onSearchChange) {
      onSearchChange('');
    }
    if (pagination) {
      pagination.onPageChange(1);
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {filters}
            {searchable && (
              <div className="relative w-full sm:w-64">
                {searchTerm ? (
                  <X 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-gray-600 z-10" 
                    onClick={handleClearSearch}
                  />
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                )}
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className={cn(
                    "h-9 border-gray-300 w-full",
                    searchTerm ? "pl-10 pr-10" : "pl-10"
                  )}
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12">
                      {appliedSearch || (emptyMessage && emptyMessage.toLowerCase().includes('encontrado')) ? (
                        <EmptyState />
                      ) : (
                        <div className="text-gray-500">{emptyMessage}</div>
                      )}
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                          {column.render
                            ? column.render(item, index)
                            : item[column.key] || <span className="text-gray-400">—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
          />
        )}
      </CardContent>
    </Card>
  );
};