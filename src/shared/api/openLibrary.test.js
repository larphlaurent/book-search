import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRatings, fetchWorkDetails, searchBooks } from './openLibrary.js'

function jsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchBooks', () => {
  it('преобразует ответ Open Library в карточки книг', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        docs: [
          {
            key: '/works/OL893415W',
            title: 'Дюна',
            author_name: ['Frank Herbert'],
            first_publish_year: 1965,
            cover_i: 123,
          },
          { key: '/works/OL27448W', title: 'The Hobbit' },
        ],
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const books = await searchBooks('Дюна')

    expect(books).toHaveLength(2)
    expect(books[0]).toEqual({
      id: 'OL893415W',
      title: 'Дюна',
      authors: 'Frank Herbert',
      year: 1965,
      coverUrl: 'https://covers.openlibrary.org/b/id/123-M.jpg',
      hasCover: true,
    })
  })

  it('подставляет значения по умолчанию для неполных данных', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ docs: [{ key: '/works/OL1W' }] }))
    )

    const [book] = await searchBooks('x')

    expect(book.title).toBe('Без названия')
    expect(book.authors).toBe('Автор неизвестен')
    expect(book.year).toBeNull()
    expect(book.hasCover).toBe(false)
    expect(book.coverUrl).toMatch(/^data:image\/svg\+xml/)
  })

  it('бросает ошибку при неуспешном HTTP-статусе', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 503)))

    await expect(searchBooks('Дюна')).rejects.toThrow('кодом 503')
  })

  it('формирует URL с поисковым запросом и лимитом', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ docs: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await searchBooks('Harry Potter')

    const url = fetchMock.mock.calls[0][0]
    expect(url).toContain('https://openlibrary.org/search.json?')
    expect(url).toContain('q=Harry+Potter')
    expect(url).toContain('limit=12')
  })
})

describe('fetchWorkDetails', () => {
  it('достаёт описание, темы и крупную обложку', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          description: { value: 'Планета Арракис…' },
          subjects: ['Science fiction', 'Desert'],
          covers: [-1, 456],
        })
      )
    )

    const details = await fetchWorkDetails('OL893415W')

    expect(details.description).toBe('Планета Арракис…')
    expect(details.subjects).toEqual(['Science fiction', 'Desert'])
    expect(details.coverUrl).toBe('https://covers.openlibrary.org/b/id/456-L.jpg')
  })
})

describe('fetchRatings', () => {
  it('возвращает среднюю оценку и число голосов', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ summary: { average: 4.25, count: 100 } }))
    )

    await expect(fetchRatings('OL893415W')).resolves.toEqual({ average: 4.25, count: 100 })
  })

  it('возвращает null без оценок', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})))

    await expect(fetchRatings('OL893415W')).resolves.toEqual({ average: null, count: 0 })
  })
})
