import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SelectField } from '@/components/ui/select-field';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/toast';
import { ROUTES } from '@/config';
import { Briefcase } from 'lucide-react';
import { usePosition, useUpdatePosition } from '../hooks/usePositions';
import { useDepartments } from '../../departments/hooks/useDepartments';

export const EditPositionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const updatePosition = useUpdatePosition();
  const { data: position, isLoading: positionLoading } = usePosition(parseInt(id!));
  const { data: departmentsResponse } = useDepartments(1, 100);

  const departments = Array.isArray(departmentsResponse?.data) ? departmentsResponse.data : (Array.isArray(departmentsResponse) ? departmentsResponse : []);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load position data when available
  useEffect(() => {
    if (position) {
      setFormData({
        name: position.name || '',
        description: position.description || '',
        departmentId: position.departmentId || 0,
        isActive: position.isActive !== false,
      });
    }
  }, [position]);

  const departmentOptions = departments
    .filter(dept => dept?.isActive)
    .map((dept: any) => ({
      value: dept.id,
      label: dept.name
    }));

  const handleDepartmentChange = (value: string | number) => {
    setFormData({ ...formData, departmentId: value as number });
    if (errors.departmentId) {
      setErrors({ ...errors, departmentId: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do cargo é obrigatório';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Departamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updatePosition.mutateAsync({
        id: parseInt(id!),
        data: {
          name: formData.name,
          description: formData.description,
          departmentId: formData.departmentId,
          isActive: formData.isActive,
        }
      });

      addToast({
        type: 'success',
        title: 'Cargo atualizado',
        description: `O cargo "${formData.name}" foi atualizado com sucesso.`,
      });

      navigate(ROUTES.positions);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar cargo',
        description: (error as Error).message,
      });
      setErrors({ general: (error as Error).message });
    }
  };

  if (positionLoading) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-gray-600">Carregando cargo...</p>
        </div>
      </div>
    );
  }

  if (!position && !positionLoading) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-red-600">Cargo não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {updatePosition.isPending && (
        <LoadingOverlay isVisible={true} message="Atualizando cargo..." />
      )}
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Cargo</h1>
        </div>
        <div className="text-sm text-gray-600">
          <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
          <span className="mx-1">/</span>
          <Link to={ROUTES.positions} className="text-gray-400 hover:text-gray-600 cursor-pointer">Cargos</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">Editar</span>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Informações do Cargo
            </CardTitle>
            <CardDescription>
              Atualize as informações do cargo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome do Cargo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Analista de Sistemas"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                  className="h-10 border-gray-300"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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
                />
                {errors.departmentId && (
                  <p className="text-sm text-red-600">{errors.departmentId}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição
              </Label>
              <textarea
                id="description"
                placeholder="Descreva as responsabilidades e requisitos do cargo..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-vertical"
                rows={4}
              />
            </div>

            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <div className="space-y-2">
              <Toggle
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                color="green"
                size="md"
              >
                Cargo ativo
              </Toggle>
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
            disabled={updatePosition.isPending}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updatePosition.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};