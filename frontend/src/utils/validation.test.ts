import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateDocument,
  validatePhone,
  validateDate,
  maskDocument,
  maskPhone,
  maskDate,
  formatDate
} from './index'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('deve validar emails válidos', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+tag@example.org')).toBe(true)
    })

    it('deve rejeitar emails inválidos', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test..test@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validateDocument', () => {
    it('deve validar CPFs válidos', () => {
      expect(validateDocument('11144477735')).toBe(true)
      expect(validateDocument('111.444.777-35')).toBe(true)
    })

    it('deve validar CNPJs válidos', () => {
      expect(validateDocument('11222333000181')).toBe(true)
      expect(validateDocument('11.222.333/0001-81')).toBe(true)
    })

    it('deve rejeitar documentos inválidos', () => {
      expect(validateDocument('12345678901')).toBe(false) // CPF inválido
      expect(validateDocument('11111111111')).toBe(false) // CPF com dígitos iguais
      expect(validateDocument('12345678000195')).toBe(false) // CNPJ inválido
      expect(validateDocument('')).toBe(false)
      expect(validateDocument('123')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('deve validar telefones válidos', () => {
      expect(validatePhone('11999999999')).toBe(true)
      expect(validatePhone('(11) 99999-9999')).toBe(true)
      expect(validatePhone('1133333333')).toBe(true)
      expect(validatePhone('(11) 3333-3333')).toBe(true)
    })

    it('deve rejeitar telefones inválidos', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('11999999')).toBe(false) // Muito curto
      expect(validatePhone('119999999999')).toBe(false) // Muito longo
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('validateDate', () => {
    it('deve validar datas válidas', () => {
      expect(validateDate('1990-01-01')).toBe(true)
      expect(validateDate('2000-12-31')).toBe(true)
    })

    it('deve rejeitar datas inválidas', () => {
      expect(validateDate('invalid-date')).toBe(false)
      expect(validateDate('2000-13-01')).toBe(false) // Mês inválido
      expect(validateDate('2000-01-32')).toBe(false) // Dia inválido
      expect(validateDate('')).toBe(false)
    })

    it('deve rejeitar datas futuras', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const futureDateString = futureDate.toISOString().split('T')[0]

      expect(validateDate(futureDateString)).toBe(false)
    })
  })

  describe('maskDocument', () => {
    it('deve mascarar CPF', () => {
      expect(maskDocument('11144477735')).toBe('111.444.777-35')
    })

    it('deve mascarar CNPJ', () => {
      expect(maskDocument('11222333000181')).toBe('11.222.333/0001-81')
    })

    it('deve retornar documento parcial sem máscara completa', () => {
      expect(maskDocument('111444')).toBe('111.444')
      expect(maskDocument('112223330001')).toBe('11.222.333/0001')
    })

    it('deve lidar com strings vazias', () => {
      expect(maskDocument('')).toBe('')
    })
  })

  describe('maskPhone', () => {
    it('deve mascarar celular', () => {
      expect(maskPhone('11999999999')).toBe('(11) 99999-9999')
    })

    it('deve mascarar telefone fixo', () => {
      expect(maskPhone('1133333333')).toBe('(11) 3333-3333')
    })

    it('deve retornar telefone parcial', () => {
      expect(maskPhone('11999')).toBe('(11) 999')
    })

    it('deve lidar com strings vazias', () => {
      expect(maskPhone('')).toBe('')
    })
  })

  describe('maskDate', () => {
    it('deve mascarar data', () => {
      expect(maskDate('01011990')).toBe('01/01/1990')
    })

    it('deve retornar data parcial', () => {
      expect(maskDate('0101')).toBe('01/01')
      expect(maskDate('01')).toBe('01')
    })

    it('deve lidar com strings vazias', () => {
      expect(maskDate('')).toBe('')
    })
  })

  describe('formatDate', () => {
    it('deve formatar data ISO para formato brasileiro', () => {
      expect(formatDate('2024-01-15T10:30:00Z')).toBe('15/01/2024')
    })

    it('deve lidar com datas inválidas', () => {
      expect(formatDate('invalid-date')).toBe('Data inválida')
    })

    it('deve lidar com strings vazias', () => {
      expect(formatDate('')).toBe('Data inválida')
    })
  })
})