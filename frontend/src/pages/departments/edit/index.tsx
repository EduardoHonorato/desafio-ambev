import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/toast';
import { ROUTES } from '@/config';
import { useDepartment, useUpdateDepartment } from '../hooks/useDepartments';

export const EditDepartmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: department, isLoading: isLoadingDepartment } = useDepartment(Number(id));
  const updateDepartment = useUpdateDepartment();

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        isActive: department.isActive !== false
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Nome é obrigatório' });
      return;
    }

    try {
      await updateDepartment.mutateAsync({
        id: Number(id),
        data: {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive
        }
      });

      addToast({
        type: 'success',
        message: 'Departamento atualizado com sucesso!'
      });

      navigate(ROUTES.departments);
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Erro ao atualizar departamento' });
    }
  };

  if (isLoadingDepartment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando departamento...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Departamento não encontrado</p>
          <Button onClick={() => navigate(ROUTES.departments)} className="mt-4">
            Voltar para Departamentos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isVisible={updateDepartment.isPending} message="Atualizando departamento..." />
      <div className="w-full">
        {/* Breadcrumbs and Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Departamento</h1>
          </div>
          <div className="text-sm text-gray-600">
            <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
            <span className="mx-1">/</span>
            <Link to={ROUTES.departments} className="text-gray-400 hover:text-gray-600 cursor-pointer">Departamentos</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-900">Editar</span>
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Informações do Departamento</CardTitle>
              <CardDescription>Atualize as informações do departamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nome do Departamento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite o nome do departamento"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 border-gray-300"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Descrição
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Descreva as responsabilidades e objetivos do departamento..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-vertical"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
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
                    Departamento ativo
                  </Toggle>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.departments)}
              className="h-10 px-6 border-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={updateDepartment.isPending}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateDepartment.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditDepartmentPage;