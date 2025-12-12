import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Users } from 'phosphor-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui/button';

interface MenuItem {
  title: string;
  icon?: React.ElementType;
  path?: string;
  badge?: string;
  children?: Omit<MenuItem, 'children' | 'icon'>[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isCollapsed?: boolean;
}

export const Sidebar = ({ isOpen, onClose, isMobile, isCollapsed = false }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['funcionários']);

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: ROUTES.dashboard,
    },
    {
      title: 'Colaboradores',
      icon: Users,
      children: [
        { title: 'Lista de Colaboradores', path: ROUTES.employees },
        { title: 'Cadastrar Colaborador', path: ROUTES.employeesCreate },
      ],
    },
    {
      title: 'Departamentos',
      icon: Building2,
      children: [
        { title: 'Lista de Departamentos', path: ROUTES.departments },
        { title: 'Cadastrar Departamento', path: ROUTES.departmentsCreate },
      ],
    },
    {
      title: 'Cargos',
      icon: Briefcase,
      children: [
        { title: 'Lista de Cargos', path: ROUTES.positions },
        { title: 'Cadastrar Cargo', path: ROUTES.positionsCreate },
      ],
    },
  ];


  const toggleExpand = (itemTitle: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemTitle)
        ? prev.filter((item) => item !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem) => {
    return item.children?.some((child) => isActive(child.path)) || false;
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  const showText = !isCollapsed;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 bg-white z-50',
          sidebarWidth,
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
          'transition-transform duration-300 ease-in-out'
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          'px-6 py-4 border-b border-gray-200 flex items-center justify-between',
          isCollapsed && 'px-4 justify-center'
        )}>
          {isCollapsed ? (
            <img
              src="https://companieslogo.com/img/orig/ABEV-c09eab6f.png?t=1742653660"
              alt="Ambev"
              className="h-8 w-auto"
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Ambev_logo_2015.svg/2560px-Ambev_logo_2015.svg.png"
                  alt="Ambev"
                  className="h-8 w-auto"
                />
              </div>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 ml-auto"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.title.toLowerCase()) && !isCollapsed;
            const parentActive = isParentActive(item);
            const itemActive = isActive(item.path);

            if (hasChildren && Icon) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => !isCollapsed && toggleExpand(item.title.toLowerCase())}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      parentActive
                        ? 'bg-blue-200'
                        : 'text-gray-700',
                      isCollapsed && 'justify-center'
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                      {showText && <span>{item.title}</span>}
                      {showText && item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-green-100">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {showText && (isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                  </button>
                  {isExpanded && showText && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.children?.map((child) => {
                        const childActive = isActive(child.path);
                        return (
                          <Link
                            key={child.path}
                            to={child.path || '#'}
                            onClick={isMobile ? onClose : undefined}
                            className={cn(
                              'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                              childActive
                                ? 'bg-blue-200'
                                : 'text-gray-700'
                            )}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (!Icon) return null;

            return (
              <Link
                key={item.path}
                to={item.path || '#'}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  itemActive
                    ? 'bg-blue-200'
                    : 'text-gray-700',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {showText && <span>{item.title}</span>}
                {showText && item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-green-100">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
};
