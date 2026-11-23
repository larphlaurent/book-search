import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SearchBar from './SearchBar.jsx'

function ControlledSearchBar({ onChange }) {
  const [value, setValue] = useState('')

  return (
    <SearchBar
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    />
  )
}

describe('SearchBar', () => {
  it('показывает поле поиска с подсказкой', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)

    expect(screen.getByLabelText('Поиск книг по названию')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите название книги…')).toBeInTheDocument()
  })

  it('передаёт введённый текст в onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<ControlledSearchBar onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'Дюна')

    expect(onChange.mock.calls.at(-1)[0]).toBe('Дюна')
    expect(screen.getByRole('textbox')).toHaveValue('Дюна')
  })

  it('очищает строку по кнопке «Очистить»', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<SearchBar value="Дюна" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Очистить' }))

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('не показывает кнопку очистки для пустой строки', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
  })
})
