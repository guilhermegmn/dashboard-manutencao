import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPICards } from '../KPICards'
import { KPICard } from '@/types/dashboard'

describe('KPICards', () => {
  const mockKPICards: KPICard[] = [
    {
      label: 'MTBF (Mean Time Between Failures)',
      value: '360h',
      numericValue: 360,
      trend: 'up',
      change: '+15.4%',
      status: 'good',
    },
    {
      label: 'MTTR (Mean Time To Repair)',
      value: '2.8h',
      numericValue: 2.8,
      trend: 'up',
      change: '+10.0%',
      status: 'good',
    },
    {
      label: 'Disponibilidade',
      value: '95%',
      numericValue: 95,
      trend: 'up',
      change: '+3.2%',
      status: 'good',
    },
    {
      label: 'Custo de Manutenção',
      value: 'R$ 1.15M',
      numericValue: 1.15,
      trend: 'down',
      change: '-5.0%',
      status: 'warning',
    },
  ]

  it('should render all KPI cards', () => {
    render(<KPICards kpiCards={mockKPICards} />)

    expect(screen.getByText('MTBF (Mean Time Between Failures)')).toBeInTheDocument()
    expect(screen.getByText('MTTR (Mean Time To Repair)')).toBeInTheDocument()
    expect(screen.getByText('Disponibilidade')).toBeInTheDocument()
    expect(screen.getByText('Custo de Manutenção')).toBeInTheDocument()
  })

  it('should display KPI values correctly', () => {
    render(<KPICards kpiCards={mockKPICards} />)

    expect(screen.getByText('360h')).toBeInTheDocument()
    expect(screen.getByText('2.8h')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.15M')).toBeInTheDocument()
  })

  it('should display change percentages', () => {
    render(<KPICards kpiCards={mockKPICards} />)

    expect(screen.getByText('+15.4%')).toBeInTheDocument()
    expect(screen.getByText('+10.0%')).toBeInTheDocument()
    expect(screen.getByText('+3.2%')).toBeInTheDocument()
    expect(screen.getByText('-5.0%')).toBeInTheDocument()
  })

  it('should render the correct number of cards', () => {
    const { container } = render(<KPICards kpiCards={mockKPICards} />)
    const cards = container.querySelectorAll('[class*="shadow-lg"]')
    expect(cards.length).toBe(4)
  })

  it('should render empty state when no cards provided', () => {
    const { container } = render(<KPICards kpiCards={[]} />)
    const cards = container.querySelectorAll('[class*="shadow-lg"]')
    expect(cards.length).toBe(0)
  })
})
