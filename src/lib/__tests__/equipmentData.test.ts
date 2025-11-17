import { describe, it, expect } from 'vitest'
import { EQUIPMENT_DATA, PERIODS, MONTH_ORDER, TREND_THRESHOLD } from '../equipmentData'

describe('equipmentData', () => {
  describe('EQUIPMENT_DATA', () => {
    it('should contain equipment data', () => {
      expect(EQUIPMENT_DATA).toBeDefined()
      expect(Array.isArray(EQUIPMENT_DATA)).toBe(true)
      expect(EQUIPMENT_DATA.length).toBeGreaterThan(0)
    })

    it('should have valid equipment structure', () => {
      EQUIPMENT_DATA.forEach((equipment) => {
        expect(equipment).toHaveProperty('id')
        expect(equipment).toHaveProperty('name')
        expect(equipment).toHaveProperty('category')
        expect(equipment).toHaveProperty('status')
        expect(equipment).toHaveProperty('history')
        expect(Array.isArray(equipment.history)).toBe(true)
      })
    })

    it('should have valid history data', () => {
      EQUIPMENT_DATA.forEach((equipment) => {
        equipment.history.forEach((record) => {
          expect(record).toHaveProperty('month')
          expect(record).toHaveProperty('MTBF')
          expect(record).toHaveProperty('MTTR')
          expect(record).toHaveProperty('Disponibilidade')
          expect(record).toHaveProperty('Custo')
          expect(typeof record.MTBF).toBe('number')
          expect(typeof record.MTTR).toBe('number')
          expect(typeof record.Disponibilidade).toBe('number')
          expect(typeof record.Custo).toBe('number')
        })
      })
    })
  })

  describe('PERIODS', () => {
    it('should contain period definitions', () => {
      expect(PERIODS).toBeDefined()
      expect(Array.isArray(PERIODS)).toBe(true)
      expect(PERIODS.length).toBeGreaterThan(0)
    })

    it('should have valid period structure', () => {
      PERIODS.forEach((period) => {
        expect(period).toHaveProperty('id')
        expect(period).toHaveProperty('label')
        expect(period).toHaveProperty('months')
        expect(Array.isArray(period.months)).toBe(true)
        expect(typeof period.id).toBe('string')
        expect(typeof period.label).toBe('string')
      })
    })
  })

  describe('MONTH_ORDER', () => {
    it('should contain all 12 months', () => {
      expect(MONTH_ORDER).toBeDefined()
      expect(Array.isArray(MONTH_ORDER)).toBe(true)
      expect(MONTH_ORDER.length).toBe(12)
    })

    it('should start with Jan and end with Dez', () => {
      expect(MONTH_ORDER[0]).toBe('Jan')
      expect(MONTH_ORDER[11]).toBe('Dez')
    })

    it('should contain all Portuguese month abbreviations', () => {
      const expectedMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      expect(MONTH_ORDER).toEqual(expectedMonths)
    })
  })

  describe('TREND_THRESHOLD', () => {
    it('should be defined', () => {
      expect(TREND_THRESHOLD).toBeDefined()
    })

    it('should be a number', () => {
      expect(typeof TREND_THRESHOLD).toBe('number')
    })

    it('should be 0.5', () => {
      expect(TREND_THRESHOLD).toBe(0.5)
    })
  })
})
