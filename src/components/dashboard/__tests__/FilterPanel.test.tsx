import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPanel } from '../FilterPanel'
import { Period, Equipment } from '@/types/dashboard'

describe('FilterPanel', () => {
  const mockPeriods: Period[] = [
    { id: '2m', label: 'Últimos 2 meses', months: ['Jul', 'Ago'] },
    { id: '3m', label: 'Últimos 3 meses', months: ['Jun', 'Jul', 'Ago'] },
  ]

  const mockEquipments: Equipment[] = [
    {
      id: 'comp-a1',
      name: 'Compressor A1',
      category: 'Compressão',
      status: 'Operacional',
      history: [],
    },
    {
      id: 'este-b2',
      name: 'Esteira B2',
      category: 'Movimentação',
      status: 'Operacional',
      history: [],
    },
  ]

  const mockCategories = ['Compressão', 'Movimentação']

  const defaultProps = {
    periods: mockPeriods,
    periodId: '3m',
    setPeriodId: vi.fn(),
    categories: mockCategories,
    category: '',
    setCategory: vi.fn(),
    equipmentOptions: mockEquipments,
    equipmentId: '',
    setEquipmentId: vi.fn(),
  }

  it('should render all three filter selects', () => {
    render(<FilterPanel {...defaultProps} />)

    expect(screen.getByLabelText('Período')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoria de Equipamento')).toBeInTheDocument()
    expect(screen.getByLabelText('Equipamento')).toBeInTheDocument()
  })

  it('should render period options correctly', () => {
    render(<FilterPanel {...defaultProps} />)

    const periodSelect = screen.getByLabelText('Período')
    expect(periodSelect).toHaveValue('3m')
    expect(screen.getByText('Últimos 2 meses')).toBeInTheDocument()
    expect(screen.getByText('Últimos 3 meses')).toBeInTheDocument()
  })

  it('should call setPeriodId when period is changed', () => {
    render(<FilterPanel {...defaultProps} />)

    const periodSelect = screen.getByLabelText('Período')
    fireEvent.change(periodSelect, { target: { value: '2m' } })

    expect(defaultProps.setPeriodId).toHaveBeenCalledWith('2m')
  })

  it('should render category options correctly', () => {
    render(<FilterPanel {...defaultProps} />)

    expect(screen.getByText('Compressão')).toBeInTheDocument()
    expect(screen.getByText('Movimentação')).toBeInTheDocument()
  })

  it('should call setCategory and reset equipment when category is changed', () => {
    render(<FilterPanel {...defaultProps} />)

    const categorySelect = screen.getByLabelText('Categoria de Equipamento')
    fireEvent.change(categorySelect, { target: { value: 'Compressão' } })

    expect(defaultProps.setCategory).toHaveBeenCalledWith('Compressão')
    expect(defaultProps.setEquipmentId).toHaveBeenCalledWith('')
  })

  it('should render equipment options', () => {
    render(<FilterPanel {...defaultProps} />)

    expect(screen.getByText('Compressor A1')).toBeInTheDocument()
    expect(screen.getByText('Esteira B2')).toBeInTheDocument()
  })

  it('should call setEquipmentId when equipment is changed', () => {
    render(<FilterPanel {...defaultProps} />)

    const equipmentSelect = screen.getByLabelText('Equipamento')
    fireEvent.change(equipmentSelect, { target: { value: 'comp-a1' } })

    expect(defaultProps.setEquipmentId).toHaveBeenCalledWith('comp-a1')
  })
})
