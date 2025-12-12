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
import { User, Mail, FileText, Phone, Plus, X } from 'lucide-react';
import { ROUTES } from '@/config';
import { useDepartments } from '../../departments/hooks/useDepartments';
import { usePositions } from '../../positions/hooks/usePositions';
import {
  maskDocument,
  validateDocument,
  maskPhone,
  validatePhone,
  maskDate,
  validateAndFormatDate,
} from '@/utils';

import { useEmployee, useUpdateEmployee } from '../hooks/useEmployees';

export const EditEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const updateEmployee = useUpdateEmployee();
  const { data: employee, isLoading: employeeLoading } = useEmployee(parseInt(id!));
  const { data: departmentsResponse } = useDepartments(1, 100); // Buscar todos para o select
  const { data: positionsResponse } = usePositions(1, 100); // Buscar todos para o select

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    document: '',
    birthDate: '',
    role: 'Employee' as 'Employee' | 'Leader' | 'Director',
    department: '',
    positionId: null as number | null,
    phones: [{ id: undefined as number | undefined, number: '', type: 'Mobile' as 'Mobile' | 'Home' | 'Work' }],
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (employee && !isDataLoaded) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        document: maskDocument(employee.document || ''),
        birthDate: employee.birthDate ? maskDate(employee.birthDate.split('T')[0].split('-').reverse().join('')) : '',
        role: typeof employee.role === 'number'
          ? (employee.role === 1 ? 'Employee' : employee.role === 2 ? 'Leader' : employee.role === 3 ? 'Director' : 'Employee')
          : employee.role,
        department: employee.department || '',
        positionId: (employee as any).positionId || null,
        phones: employee.phones?.length > 0 ? employee.phones.map(phone => ({
          id: phone.id,
          number: maskPhone(phone.number || ''),
          type: phone.type as 'Mobile' | 'Home' | 'Work'
        })) : [{ id: undefined, number: '', type: 'Mobile' as 'Mobile' }],
        isActive: employee.isActive ?? true,
      });
      setIsDataLoaded(true);
    }
  }, [employee, isDataLoaded]);

  const departments = Array.isArray(departmentsResponse?.data) ? departmentsResponse.data : (Array.isArray(departmentsResponse) ? departmentsResponse : []);
  const positions = Array.isArray(positionsResponse?.data) ? positionsResponse.data : (Array.isArray(positionsResponse) ? positionsResponse : []);

  const departmentOptions = (departments || [])
    .filter((dept: any) => dept?.isActive)
    .map((dept: any) => ({
      value: dept.name,
      label: dept.name
    }));

  const positionOptions = (positions || [])
    .filter((pos: any) => pos?.isActive && (!formData.department || pos.departmentName === formData.department))
    .map((pos: any) => ({
      value: pos.id.toString(),
      label: pos.name
    }));

  const roleOptions = [
    { value: 'Employee', label: 'Colaborador' },
    { value: 'Leader', label: 'Líder' },
    { value: 'Director', label: 'Diretor' }
  ];

  const handleDocumentChange = (value: string) => {
    const masked = maskDocument(value);
    setFormData({ ...formData, document: masked });
    if (errors.document) {
      setErrors({ ...errors, document: '' });
    }
  };

  const handleBirthDateChange = (value: string) => {
    const masked = maskDate(value);
    setFormData({ ...formData, birthDate: masked });
    if (errors.birthDate) {
      setErrors({ ...errors, birthDate: '' });
    }
  };

  const handleDepartmentChange = (value: string | number) => {
    setFormData({ ...formData, department: value as string, positionId: null });
    if (errors.department) {
      setErrors({ ...errors, department: '' });
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const masked = maskPhone(value);
    const newPhones = [...formData.phones];
    newPhones[index] = { ...newPhones[index], number: masked };
    setFormData({ ...formData, phones: newPhones });
  };

  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { id: undefined, number: '', type: 'Mobile' }],
    });
  };

  const removePhone = (index: number) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData({ ...formData, phones: newPhones });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Nome é obrigatório';
    if (!formData.lastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.document.trim()) newErrors.document = 'CPF/CNPJ é obrigatório';
    if (!formData.birthDate.trim()) newErrors.birthDate = 'Data de nascimento é obrigatória';
    if (!formData.department.trim()) newErrors.department = 'Departamento é obrigatório';
    if (!formData.positionId) newErrors.position = 'Cargo é obrigatório';

    if (formData.document && !validateDocument(formData.document)) {
      newErrors.document = 'CPF/CNPJ inválido';
    }

    formData.phones.forEach((phone, index) => {
      if (phone.number && !validatePhone(phone.number)) {
        newErrors[`phone_${index}`] = 'Telefone inválido';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formattedDate = validateAndFormatDate(formData.birthDate);
    if (!formattedDate) {
      setErrors({ birthDate: 'Data de nascimento inválida' });
      return;
    }

    try {
      const roleMap = { 'Employee': 1, 'Leader': 2, 'Director': 3 };

      const validPhones = formData.phones
        .filter(phone => phone.number.trim() !== '')
        .map(phone => ({
          number: phone.number.replace(/\D/g, ''),
          type: phone.type,
        }))
        .filter((phone, index, self) =>
          index === self.findIndex((p) => p.number === phone.number && p.type === phone.type)
        );

      if (validPhones.length === 0) {
        setErrors({ general: 'Pelo menos um telefone é obrigatório' });
        return;
      }

      await updateEmployee.mutateAsync({
        id: parseInt(id!),
        data: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          document: formData.document.replace(/\D/g, ''),
          birthDate: formattedDate,
          role: roleMap[formData.role],
          department: formData.department,
          positionId: formData.positionId || undefined,
          phones: validPhones,
          isActive: formData.isActive,
        }
      });

      addToast({
        type: 'success',
        title: 'Funcionário atualizado',
        description: `${formData.firstName} ${formData.lastName} foi atualizado com sucesso.`,
      });

      navigate(ROUTES.employees);
    } catch (error: any) {
      let errorMessage = 'Erro ao atualizar funcionário. Tente novamente.';

      if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'Você não tem permissão para editar funcionários com este perfil.';
      } else if (error.response?.data?.errors) {
        const validationErrors: string[] = [];
        Object.keys(error.response.data.errors).forEach((key) => {
          const fieldErrors = error.response.data.errors[key];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg: string) => {
              validationErrors.push(msg);
            });
          }
        });
        if (validationErrors.length > 0) {
          errorMessage = validationErrors.join('. ');
        }

        const fieldErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          fieldErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast({
        type: 'error',
        title: 'Erro ao Atualizar Funcionário',
        description: errorMessage,
        duration: 5000,
      });

      if (!error.response?.data?.errors) {
        setErrors({ general: errorMessage });
      }
    }
  };

  if (employeeLoading) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-gray-600">Carregando funcionário...</p>
        </div>
      </div>
    );
  }

  if (!employee && !employeeLoading) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-red-600">Funcionário não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {updateEmployee.isPending && (
        <LoadingOverlay isVisible={true} message="Atualizando colaborador..." />
      )}
      {/* Breadcrumbs and Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Colaborador</h1>
        </div>
        <div className="text-sm text-gray-600">
          <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
          <span className="mx-1">/</span>
          <Link to={ROUTES.employees} className="text-gray-400 hover:text-gray-600 cursor-pointer">Colaboradores</Link>
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
        {/* Seção: Informações Básicas */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Informações Básicas</CardTitle>
            <CardDescription>Dados pessoais do funcionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primeira linha: Nome, Sobrenome e Data de Nascimento */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Digite o nome"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Sobrenome <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Digite o sobrenome"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                  Data de Nascimento <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="birthDate"
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={formData.birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    maxLength={10}
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.birthDate && (
                  <p className="text-sm text-red-600">{errors.birthDate}</p>
                )}
              </div>
            </div>

            {/* Segunda linha: Email e Documento */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document" className="text-sm font-medium text-gray-700">
                  CPF/CNPJ <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="document"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.document}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                    maxLength={18}
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.document && (
                  <p className="text-sm text-red-600">{errors.document}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Informações Profissionais */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Informações Profissionais</CardTitle>
            <CardDescription>Departamento e cargo do funcionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                  Departamento <span className="text-red-500">*</span>
                </Label>
                <SelectField
                  options={departmentOptions}
                  value={formData.department}
                  onChange={handleDepartmentChange}
                  placeholder="Selecione o departamento"
                />
                {errors.department && (
                  <p className="text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                  Cargo <span className="text-red-500">*</span>
                </Label>
                <SelectField
                  options={positionOptions}
                  value={formData.positionId ? formData.positionId.toString() : ''}
                  onChange={(value) => {
                    const newPositionId = value ? parseInt(String(value)) : null;
                    setFormData({ ...formData, positionId: newPositionId });
                    if (errors.position) {
                      setErrors({ ...errors, position: '' });
                    }
                  }}
                  placeholder={formData.department ? 'Selecione o cargo' : 'Selecione primeiro o departamento'}
                  disabled={!formData.department}
                  allowSearch={true}
                />
                {errors.position && (
                  <p className="text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Nível Hierárquico <span className="text-red-500">*</span>
                </Label>
                <SelectField
                  options={roleOptions}
                  value={roleOptions.some(opt => opt.value === formData.role) ? formData.role : ''}
                  onChange={(value) => setFormData({ ...formData, role: value as any })}
                  placeholder="Selecione o nível"
                  allowSearch={false}
                />
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Telefones */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Telefones</CardTitle>
            <CardDescription>Números de contato do funcionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.phones.map((phone, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Telefone {index + 1}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={phone.number}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      maxLength={15}
                      className="pl-10 h-10 border-gray-300"
                    />
                  </div>
                  {errors[`phone_${index}`] && (
                    <p className="text-sm text-red-600">{errors[`phone_${index}`]}</p>
                  )}
                </div>

                <div className="w-32 space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                  <SelectField
                    options={[
                      { value: 'Mobile', label: 'Celular' },
                      { value: 'Home', label: 'Residencial' },
                      { value: 'Work', label: 'Comercial' }
                    ]}
                    value={phone.type}
                    onChange={(value) => {
                      const newPhones = [...formData.phones];
                      newPhones[index] = { ...newPhones[index], type: value as any };
                      setFormData({ ...formData, phones: newPhones });
                    }}
                    allowSearch={false}
                  />
                </div>

                <div className="flex gap-2">
                  {formData.phones.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePhone(index)}
                      className="h-10 w-10 p-0 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {index === formData.phones.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPhone}
                      className="h-10 w-10 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Seção: Status */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Status</CardTitle>
            <CardDescription>Status do colaborador no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Toggle
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                color="green"
                size="md"
              >
                Colaborador ativo
              </Toggle>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.employees)}
            className="flex items-center gap-2 h-10 px-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <Button
            type="submit"
            disabled={updateEmployee.isPending}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateEmployee.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};