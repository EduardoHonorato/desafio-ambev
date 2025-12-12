import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { OtpPage } from '@/pages/OtpPage';
import { DashboardPage } from '@/pages/dashboard';
import { EmployeesPage } from '@/pages/employees';
import { CreateEmployeePage } from '@/pages/employees/create';
import { EditEmployeePage } from '@/pages/employees/edit';
import { DepartmentsPage } from '@/pages/departments';
import { CreateDepartmentPage } from '@/pages/departments/create';
import { EditDepartmentPage } from '@/pages/departments/edit';
import { PositionsPage } from '@/pages/positions';
import { CreatePositionPage } from '@/pages/positions/create';
import { EditPositionPage } from '@/pages/positions/edit';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config';
import { ToastProvider } from '@/components/ui/toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={
          isAuthenticated() ? <Navigate to={ROUTES.dashboard} replace /> : <LoginPage />
        }
      />
      <Route
        path="/otp"
        element={
          isAuthenticated() ? <Navigate to={ROUTES.dashboard} replace /> : <OtpPage />
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.employees} element={<EmployeesPage />} />
        <Route path={ROUTES.employeesCreate} element={<CreateEmployeePage />} />
        <Route path="/employees/edit/:id" element={<EditEmployeePage />} />
        <Route path={ROUTES.departments} element={<DepartmentsPage />} />
        <Route path={ROUTES.departmentsCreate} element={<CreateDepartmentPage />} />
        <Route path="/departments/edit/:id" element={<EditDepartmentPage />} />
        <Route path={ROUTES.positions} element={<PositionsPage />} />
        <Route path={ROUTES.positionsCreate} element={<CreatePositionPage />} />
        <Route path="/positions/edit/:id" element={<EditPositionPage />} />
        <Route path={ROUTES.home} element={<Navigate to={ROUTES.dashboard} replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
