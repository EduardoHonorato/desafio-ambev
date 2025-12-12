import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-field';
import { useToast } from '@/components/ui/toast';
import { ROUTES } from '@/config';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreatePosition } from '../hooks/usePositions';
import { useDepartments } from '../../departments/hooks/useDepartments';

export const CreatePositionPage = () => {
  const navigate = useNavigate();
  const createPosition = useCreatePosition();
  const { data: departmentsResponse } = useDepartments(1, 100);
  const departments = Array.isArray(departmentsResponse?.data) ? departmentsResponse.data : (Array.isArray(departmentsResponse) ? departmentsResponse : []);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const departmentOptions = departments
    .filter(dept => dept?.isActive)
    .map((dept: any) => ({
      value: dept.id,
      label: dept.name
    }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Departamento é obrigatório';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDepartmentChange = (departmentName: string) => {
    const department = departments.find(dept => dept.name === departmentName);
    setFormData({ ...formData, departmentId: department?.id || 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        departmentId: formData.departmentId,
      });

      addToast({
        type: 'success',
        title: 'Cargo criado',
        description: `O cargo "${formData.name}" foi criado com sucesso.`,
      });

      navigate(ROUTES.positions);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao criar cargo',
        description: (error as Error).message,
      });
      setErrors({ general: (error as Error).message });
    }
  };

  return (
    <div className="w-full">
      {createPosition.isPending && (
        <LoadingOverlay isVisible={true} message="Criando cargo..." />
      )}
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Cargo</h1>
        </div>
        <div className="text-sm text-gray-600">
          <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
          <span className="mx-1">/</span>
          <Link to={ROUTES.positions} className="text-gray-400 hover:text-gray-600 cursor-pointer">Cargos</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">Cadastrar</span>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Informações do Cargo</CardTitle>
            <CardDescription>Dados do novo cargo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-sm font-medium text-gray-700">
                  Departamento <span className="text-red-500">*</span>
                </Label>
                <SelectField
                  options={departmentOptions}
                  value={formData.departmentId}
                  onChange={handleDepartmentChange}
                  placeholder="Selecione um departamento"
                  allowSearch={true}
                  className="w-full"
                  style={{ width: 'calc(100% + 20px)' }}
                />
                {errors.departmentId && (
                  <p className="text-sm text-red-600">{errors.departmentId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome do Cargo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite o nome do cargo"
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Digite uma descrição para o cargo (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.positions)}
            className="flex items-center gap-2 h-10 px-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <Button
            type="submit"
            disabled={createPosition.isPending}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createPosition.isPending ? 'Salvando...' : 'Criar Cargo'}
          </Button>
        </div>
      </form>
    </div>
  );
};