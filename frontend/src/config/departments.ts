/**
 * Departments and their associated positions
 */

export interface Department {
  id: string;
  name: string;
  positions: string[];
}

export const departments: Department[] = [
  {
    id: 'ti',
    name: 'Tecnologia da Informação',
    positions: [
      'Desenvolvedor Frontend',
      'Desenvolvedor Backend',
      'Desenvolvedor Full Stack',
      'Arquiteto de Software',
      'DevOps Engineer',
      'QA Engineer',
      'Tech Lead',
      'Gerente de TI',
      'Analista de Sistemas',
      'Analista de Dados',
      'Data Scientist',
      'Product Owner',
      'Scrum Master',
      'Mobile Developer',
      'UI/UX Designer',
    ],
  },
  {
    id: 'rh',
    name: 'Recursos Humanos',
    positions: [
      'Analista de RH',
      'Especialista em Recrutamento',
      'Especialista em Treinamento',
      'Especialista em Folha de Pagamento',
      'Gerente de RH',
      'Coordenador de RH',
      'Analista de Departamento Pessoal',
      'Especialista em Benefícios',
      'Headhunter',
      'Psicólogo Organizacional',
      'Especialista em Compliance',
    ],
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    positions: [
      'Analista Financeiro',
      'Contador',
      'Controller',
      'Gerente Financeiro',
      'Analista de Contas a Pagar',
      'Analista de Contas a Receber',
      'Analista de Tesouraria',
      'Especialista em Orçamento',
      'Auditor Interno',
      'CFO',
      'Analista Fiscal',
    ],
  },
  {
    id: 'comercial',
    name: 'Comercial',
    positions: [
      'Vendedor',
      'Representante Comercial',
      'Gerente de Vendas',
      'Coordenador de Vendas',
      'Analista de Vendas',
      'Key Account Manager',
      'Business Development',
      'Inside Sales',
      'Especialista em Pré-Vendas',
      'Diretor Comercial',
      'Consultor Comercial',
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    positions: [
      'Analista de Marketing',
      'Especialista em Marketing Digital',
      'Gerente de Marketing',
      'Coordenador de Marketing',
      'Social Media',
      'Content Manager',
      'SEO Specialist',
      'Growth Hacker',
      'Product Marketing Manager',
      'Brand Manager',
      'Marketing Analyst',
    ],
  },
  {
    id: 'operacoes',
    name: 'Operações',
    positions: [
      'Analista de Operações',
      'Coordenador de Operações',
      'Gerente de Operações',
      'Supervisor de Operações',
      'Especialista em Processos',
      'Analista de Qualidade',
      'Especialista em Logística',
      'Coordenador de Logística',
      'Operador de Produção',
      'Líder de Produção',
    ],
  },
  {
    id: 'juridico',
    name: 'Jurídico',
    positions: [
      'Advogado',
      'Analista Jurídico',
      'Gerente Jurídico',
      'Especialista em Compliance',
      'Consultor Jurídico',
      'Coordenador Jurídico',
      'Assessor Jurídico',
    ],
  },
  {
    id: 'atendimento',
    name: 'Atendimento ao Cliente',
    positions: [
      'Atendente',
      'Analista de Atendimento',
      'Especialista em Suporte',
      'Supervisor de Atendimento',
      'Gerente de Atendimento',
      'Coordenador de Atendimento',
      'Customer Success Manager',
    ],
  },
  {
    id: 'administrativo',
    name: 'Administrativo',
    positions: [
      'Assistente Administrativo',
      'Analista Administrativo',
      'Coordenador Administrativo',
      'Gerente Administrativo',
      'Recepcionista',
      'Secretário',
      'Auxiliar Administrativo',
    ],
  },
  {
    id: 'vendas',
    name: 'Vendas',
    positions: [
      'Vendedor Externo',
      'Vendedor Interno',
      'Gerente de Vendas',
      'Supervisor de Vendas',
      'Consultor de Vendas',
      'Especialista em Vendas',
      'Coordenador de Vendas',
    ],
  },
];

export const getPositionsByDepartment = (departmentName: string): string[] => {
  const department = departments.find(
    (dept) => dept.name.toLowerCase() === departmentName.toLowerCase()
  );
  return department?.positions || [];
};