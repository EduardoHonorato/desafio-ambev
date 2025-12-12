import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateEmployee } from '../hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SelectField } from '@/components/ui/select-field';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useToast } from '@/components/ui/toast';
import type { CreateEmployeeRequest } from '@/services/authService';
import { User, Mail, FileText, Lock, Building, Phone, Plus, X, ArrowLeft } from 'lucide-react';
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

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    document: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    role: 'Employee' as 'Employee' | 'Leader' | 'Director',
    department: '',
    position: '',
    managerId: undefined as number | undefined,
    phones: [{ number: '', type: 'Mobile' }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departmentsResponse } = useDepartments(1, 100);
  const { data: positionsResponse } = usePositions(1, 100);

  const departments = Array.isArray(departmentsResponse?.data) ? departmentsResponse.data : (Array.isArray(departmentsResponse) ? departmentsResponse : []);
  const positions = Array.isArray(positionsResponse?.data) ? positionsResponse.data : (Array.isArray(positionsResponse) ? positionsResponse : []);

  const departmentOptions = departments.map((dept: any) => ({
    value: dept.name,
    label: dept.name
  }));

  const positionOptions = positions
    .filter((pos: any) => !formData.department || pos.departmentName === formData.department)
    .map((pos: any) => ({
      value: pos.name,
      label: pos.name
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const docNumbers = formData.document.replace(/\D/g, '');
    if (docNumbers.length > 0 && !validateDocument(formData.document)) {
      setErrors({ document: 'CPF ou CNPJ inválido' });
      return;
    }

    const formattedDate = validateAndFormatDate(formData.birthDate);
    if (!formattedDate) {
      setErrors({ birthDate: 'Data de nascimento inválida' });
      return;
    }

    for (let i = 0; i < formData.phones.length; i++) {
      const phone = formData.phones[i];
      if (!validatePhone(phone.number)) {
        setErrors({ [`phone_${i}`]: 'Telefone inválido' });
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'As senhas não coincidem' });
      return;
    }

    try {
      const roleMap = { 'Employee': 1, 'Leader': 2, 'Director': 3 };

      const createData: CreateEmployeeRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        document: formData.document.replace(/\D/g, ''),
        birthDate: formattedDate,
        password: formData.password,
        role: roleMap[formData.role],
        department: formData.position || formData.department,
        managerId: formData.managerId,
        phones: formData.phones.map((phone) => ({
          number: phone.number.replace(/\D/g, ''),
          type: phone.type,
        })),
      };
      await createEmployee.mutateAsync(createData);
      addToast({
        type: 'success',
        title: 'Funcionário Criado',
        description: 'O funcionário foi criado com sucesso.',
        duration: 5000,
      });
      navigate(ROUTES.employees);
    } catch (error: any) {
      let errorMessage = 'Erro ao criar funcionário. Tente novamente.';

      if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'Você não tem permissão para criar funcionários com este perfil.';
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

        // Também setar erros nos campos
        const fieldErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          fieldErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Sempre exibir toast de erro
      addToast({
        type: 'error',
        title: 'Erro ao Criar Funcionário',
        description: errorMessage,
        duration: 5000,
      });
    }
  };

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

  const handleDepartmentChange = (department: string) => {
    setFormData({ ...formData, department, position: '' });
  };

  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { number: '', type: 'Mobile' }],
    });
  };

  const removePhone = (index: number) => {
    if (formData.phones.length > 1) {
      setFormData({
        ...formData,
        phones: formData.phones.filter((_, i) => i !== index),
      });
    }
  };

  const updatePhone = (index: number, field: 'number' | 'type', value: string) => {
    const newPhones = [...formData.phones];
    if (field === 'number') {
      newPhones[index] = { ...newPhones[index], number: maskPhone(value) };
    } else {
      newPhones[index] = { ...newPhones[index], [field]: value };
    }
    setFormData({ ...formData, phones: newPhones });
    if (errors[`phone_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`phone_${index}`];
      setErrors(newErrors);
    }
  };

  return (
    <div className="w-full">
      {createEmployee.isPending && (
        <LoadingOverlay isVisible={true} message="Criando colaborador..." />
      )}
      {/* Breadcrumbs and Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Colaborador</h1>
        </div>
        <div className="text-sm text-gray-600">
          <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
          <span className="mx-1">/</span>
          <Link to={ROUTES.employees} className="text-gray-400 hover:text-gray-600 cursor-pointer">Colaboradores</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">Cadastrar</span>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Informações Básicas */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Informações Básicas</CardTitle>
            <CardDescription className="">Dados pessoais do colaborador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primeira linha: Nome, Sobrenome e Data de Nascimento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <CardDescription className="">Departamento e cargo do colaborador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  value={formData.position}
                  onChange={(value) => setFormData({ ...formData, position: value as string })}
                  placeholder={formData.department ? 'Selecione o cargo' : 'Selecione primeiro o departamento'}
                  disabled={!formData.department}
                />
                {errors.position && (
                  <p className="text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Nível Hierárquico <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Employee' | 'Leader' | 'Director' })}
                    className="w-full pl-10 h-10 rounded-md border border-gray-300"
                    required
                  >
                    <option value="Employee">Colaborador</option>
                    <option value="Leader">Líder</option>
                    <option value="Director">Diretor</option>
                  </select>
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Contato */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Contato</CardTitle>
            <CardDescription className="">Telefones de contato do colaborador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.phones.map((phone, index) => (
              <div key={index} className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Telefone {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={phone.number}
                      onChange={(e) => updatePhone(index, 'number', e.target.value)}
                      maxLength={15}
                      className="pl-10 h-10 border-gray-300"
                      required={index === 0}
                    />
                  </div>
                  <select
                    value={phone.type}
                    onChange={(e) => updatePhone(index, 'type', e.target.value)}
                    className="h-10 rounded-md border border-gray-300"
                  >
                    <option value="Mobile">Celular</option>
                    <option value="Landline">Fixo</option>
                  </select>
                  {formData.phones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removePhone(index)}
                      className="h-10 px-3 hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                {errors[`phone_${index}`] && (
                  <p className="text-sm text-red-600">{errors[`phone_${index}`]}</p>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPhone}
              className="w-full h-10 border-gray-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Telefone
            </Button>
            {errors.phones && (
              <p className="text-sm text-red-600">{errors.phones}</p>
            )}
          </CardContent>
        </Card>

        {/* Seção: Segurança */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Segurança</CardTitle>
            <CardDescription className="">Defina a senha de acesso do colaborador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite a senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Senha <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 h-10 border-gray-300"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
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
            disabled={createEmployee.isPending}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createEmployee.isPending ? 'Criando...' : 'Criar Colaborador'}
          </Button>
        </div>
      </form>
    </div>
  );
};
