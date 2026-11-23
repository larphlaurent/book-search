import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BookList from './BookList.jsx'

const dune = {
  id: 'OL893415W',
  title: 'Дюна',
  authors: 'Frank Herbert',
  year: 1965,
  coverUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  hasCover: true,
}

const hobbit = {
  id: 'OL27448W',
  title: 'The Hobbit',
  authors: 'J. R. R. Tolkien',
  year: 1937,
  coverUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  hasCover: true,
}

describe('BookList', () => {
  it('показывает заглушку, если книг нет', () => {
    render(<BookList books={[]} onSelect={vi.fn()} />)

    expect(screen.getByText('Книги не найдены — попробуйте другой запрос')).toBeInTheDocument()
  })

  it('рендерит карточку для каждой книги', () => {
    render(<BookList books={[dune, hobbit]} onSelect={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Дюна' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The Hobbit' })).toBeInTheDocument()
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
    expect(screen.getByText('Год: 1937')).toBeInTheDocument()
  })

  it('передаёт выбранную книгу в onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<BookList books={[dune]} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: 'Подробнее' }))

    expect(onSelect).toHaveBeenCalledWith(dune)
  })
})
