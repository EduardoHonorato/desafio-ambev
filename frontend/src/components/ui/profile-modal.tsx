import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, FileText, Phone, Lock, Calendar, Plus, X } from 'lucide-react';
import { maskDocument, maskPhone, maskDate, validateAndFormatDate, validateDocument, validatePhone } from '@/utils';
import { employeeService, type UpdateProfileRequest } from '@/services/authService';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const formatDateFromAPI = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};

export const ProfileModal = ({ isOpen, onClose, user }: ProfileModalProps) => {
  const { addToast } = useToast();
  const { getCurrentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    document: '',
    birthDate: '',
    phones: [{ id: undefined as number | undefined, number: '', type: 'Mobile' as 'Mobile' | 'Home' | 'Work' }],
    password: '',
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        document: user?.document ? maskDocument(user.document) : '',
        birthDate: formatDateFromAPI(user?.birthDate),
        phones: user?.phones?.length > 0 ? user.phones.map((phone: any) => ({
          id: phone.id,
          number: maskPhone(phone.number || ''),
          type: phone.type as 'Mobile' | 'Home' | 'Work'
        })) : [{ id: undefined, number: '', type: 'Mobile' as 'Mobile' }],
        password: '',
      });
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (!formData.firstName || !formData.lastName || !formData.email || !formData.document || !formData.birthDate) {
        addToast({
          type: 'error',
          title: 'Erro de Validação',
          description: 'Por favor, preencha todos os campos obrigatórios.',
          duration: 5000,
        });
        setIsSaving(false);
        return;
      }

      if (!validateDocument(formData.document)) {
        addToast({
          type: 'error',
          title: 'Erro de Validação',
          description: 'CPF/CNPJ inválido.',
          duration: 5000,
        });
        setIsSaving(false);
        return;
      }

      const formattedDate = validateAndFormatDate(formData.birthDate);
      if (!formattedDate) {
        addToast({
          type: 'error',
          title: 'Erro de Validação',
          description: 'Data de nascimento inválida. Use o formato DD/MM/AAAA.',
          duration: 5000,
        });
        setIsSaving(false);
        return;
      }

      const validPhones = formData.phones.filter(p => p.number.trim() !== '');
      if (validPhones.length === 0) {
        addToast({
          type: 'error',
          title: 'Erro de Validação',
          description: 'Pelo menos um telefone é obrigatório.',
          duration: 5000,
        });
        setIsSaving(false);
        return;
      }

      for (const phone of validPhones) {
        if (!validatePhone(phone.number)) {
          addToast({
            type: 'error',
            title: 'Erro de Validação',
            description: `Telefone "${phone.number}" inválido.`,
            duration: 5000,
          });
          setIsSaving(false);
          return;
        }
      }

      // Validar senha se fornecida
      if (formData.password && formData.password.trim().length > 0) {
        if (formData.password.trim().length < 6) {
          addToast({
            type: 'error',
            title: 'Erro de Validação',
            description: 'A senha deve ter no mínimo 6 caracteres.',
            duration: 5000,
          });
          setIsSaving(false);
          return;
        }
      }

      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        document: formData.document.replace(/\D/g, ''),
        birthDate: formattedDate,
        phones: validPhones.map(phone => ({
          number: phone.number.replace(/\D/g, ''),
          type: phone.type
        })),
        password: formData.password.trim() || undefined,
      };

      const updatedUser = await employeeService.updateProfile(updateData);

      localStorage.setItem('user', JSON.stringify(updatedUser));
      queryClient.setQueryData(['user'], updatedUser);

      addToast({
        type: 'success',
        title: 'Perfil Atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
        duration: 5000,
      });

      onClose();
    } catch (error: any) {
      let errorMessage = 'Não foi possível atualizar o perfil. Tente novamente.';
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages: string[] = [];
        
        Object.keys(validationErrors).forEach((field) => {
          const fieldErrors = validationErrors[field];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg: string) => {
              errorMessages.push(msg);
            });
          }
        });
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('. ');
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: 'error',
        title: 'Erro ao Atualizar Perfil',
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Resetar dados formatados
    if (user) {
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        document: user?.document ? maskDocument(user.document) : '',
        birthDate: formatDateFromAPI(user?.birthDate),
        phones: user?.phones?.length > 0 ? user.phones.map((phone: any) => ({
          id: phone.id,
          number: maskPhone(phone.number || ''),
          type: phone.type as 'Mobile' | 'Home' | 'Work'
        })) : [{ id: undefined, number: '', type: 'Mobile' as 'Mobile' }],
        password: '',
      });
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index].number = maskPhone(value);
    setFormData({ ...formData, phones: newPhones });
  };

  const handlePhoneTypeChange = (index: number, type: 'Mobile' | 'Home' | 'Work') => {
    const newPhones = [...formData.phones];
    newPhones[index].type = type;
    setFormData({ ...formData, phones: newPhones });
  };

  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { id: undefined, number: '', type: 'Mobile' as 'Mobile' }]
    });
  };

  const removePhone = (index: number) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData({ ...formData, phones: newPhones });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </DialogTitle>
          <DialogDescription>
            Visualize e edite suas informações pessoais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document">CPF/CNPJ</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="document"
                      value={formData.document}
                      onChange={(e) => setFormData({ ...formData, document: maskDocument(e.target.value) })}
                      className="pl-10"
                      maxLength={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="birthDate"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: maskDate(e.target.value) })}
                      placeholder="DD/MM/AAAA"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Telefones</Label>
                {formData.phones.map((phone, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        value={phone.number}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        maxLength={15}
                      />
                    </div>
                    <select
                      value={phone.type}
                      onChange={(e) => handlePhoneTypeChange(index, e.target.value as 'Mobile' | 'Home' | 'Work')}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Mobile">Celular</option>
                      <option value="Home">Residencial</option>
                      <option value="Work">Trabalho</option>
                    </select>
                    {formData.phones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(index)}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhone}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Telefone
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha (opcional)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Digite uma nova senha"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};