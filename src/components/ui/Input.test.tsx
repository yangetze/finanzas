import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('opens the native date picker when a date input is clicked', async () => {
    const user = userEvent.setup()
    render(<Input label="Fecha" type="date" value="2026-08-04" onChange={() => {}} />)

    const input = screen.getByLabelText('Fecha') as HTMLInputElement
    const showPicker = vi.fn()
    input.showPicker = showPicker

    await user.click(input)

    expect(showPicker).toHaveBeenCalledTimes(1)
  })

  it('does not call showPicker for non-date inputs', async () => {
    const user = userEvent.setup()
    render(<Input label="Monto" type="number" value="10" onChange={() => {}} />)

    const input = screen.getByLabelText('Monto') as HTMLInputElement
    const showPicker = vi.fn()
    input.showPicker = showPicker

    await user.click(input)

    expect(showPicker).not.toHaveBeenCalled()
  })
})
