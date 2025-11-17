import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EquipmentTable } from '../EquipmentTable'
import { EquipmentWithAvailability } from '@/types/dashboard'

describe('EquipmentTable', () => {
  const mockEquipments: EquipmentWithAvailability[] = [
    {
      id: 'comp-a1',
      name: 'Compressor A1',
      category: 'Compressão',
      status: 'Operacional',
      history: [],
      availability: 95.5,
      availabilityLabel: '95.5%',
      trend: 'up',
    },
    {
      id: 'este-b2',
      name: 'Esteira B2',
      category: 'Movimentação',
      status: 'Manutenção Programada',
      history: [],
      availability: 92.0,
      availabilityLabel: '92.0%',
      trend: 'stable',
    },
    {
      id: 'motor-c3',
      name: 'Motor C3',
      category: 'Motorização',
      status: 'Parado',
      history: [],
      availability: 88.5,
      availabilityLabel: '88.5%',
      trend: 'down',
    },
  ]

  it('should render table headers', () => {
    render(<EquipmentTable equipments={mockEquipments} />)

    expect(screen.getByText('Máquina')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Disponibilidade')).toBeInTheDocument()
    expect(screen.getByText('Tendência')).toBeInTheDocument()
  })

  it('should render all equipment rows', () => {
    render(<EquipmentTable equipments={mockEquipments} />)

    expect(screen.getByText('Compressor A1')).toBeInTheDocument()
    expect(screen.getByText('Esteira B2')).toBeInTheDocument()
    expect(screen.getByText('Motor C3')).toBeInTheDocument()
  })

  it('should display categories correctly', () => {
    render(<EquipmentTable equipments={mockEquipments} />)

    expect(screen.getByText('Compressão')).toBeInTheDocument()
    expect(screen.getByText('Movimentação')).toBeInTheDocument()
    expect(screen.getByText('Motorização')).toBeInTheDocument()
  })

  it('should display status badges', () => {
    render(<EquipmentTable equipments={mockEquipments} />)

    expect(screen.getByText('Operacional')).toBeInTheDocument()
    expect(screen.getByText('Manutenção Programada')).toBeInTheDocument()
    expect(screen.getByText('Parado')).toBeInTheDocument()
  })

  it('should display availability percentages', () => {
    render(<EquipmentTable equipments={mockEquipments} />)

    expect(screen.getByText('95.5%')).toBeInTheDocument()
    expect(screen.getByText('92.0%')).toBeInTheDocument()
    expect(screen.getByText('88.5%')).toBeInTheDocument()
  })

  it('should render empty state when no equipments provided', () => {
    render(<EquipmentTable equipments={[]} />)

    expect(screen.getByText('Nenhum equipamento encontrado para os filtros selecionados')).toBeInTheDocument()
  })

  it('should render correct number of table rows', () => {
    const { container } = render(<EquipmentTable equipments={mockEquipments} />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(3)
  })
})
