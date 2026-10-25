import { act, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi } from 'vitest'
import { StrictMode } from 'react'
import App from '../App'
import { PRODUCTS_URL } from '../hooks/useProducts'
const products = [
  {
    id: 1,
    title: 'Everyday bag',
    price: 19.99,
    image: 'https://example.com/bag.jpg',
    category: 'Accessories',
  },
  {
    id: 2,
    title: 'Cotton shirt',
    price: 10.1,
    image: 'https://example.com/shirt.jpg',
    category: 'Clothing',
  },
]
function mockCatalog(data = products) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue({ ok: true, json: async () => data })
}
function open(path = '/shop', strict = false) {
  const app = (
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
  return {
    user: userEvent.setup(),
    ...render(strict ? <StrictMode>{app}</StrictMode> : app),
  }
}
async function bagCard() {
  return (await screen.findByRole('heading', { name: 'Everyday bag' })).closest(
    'article',
  )
}
describe('catalog and navigation', () => {
  it('shows loading and then products with real product information', async () => {
    let resolve
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    open()
    expect(screen.getByText(/Gathering the good things/)).toBeInTheDocument()
    await act(async () => resolve({ ok: true, json: async () => products }))
    expect(
      await screen.findByRole('heading', { name: 'Everyday bag' }),
    ).toBeInTheDocument()
    expect(screen.getByText('$19.99')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Everyday bag' })).toHaveAttribute(
      'src',
      products[0].image,
    )
  })
  it('turns a stalled request into a retry state and ignores its late response', async () => {
    vi.useFakeTimers()
    let resolve
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    try {
      open()
      await act(async () => vi.advanceTimersByTime(15000))
      expect(screen.getByRole('alert')).toHaveTextContent('couldn’t load')
      expect(fetch.mock.calls[0][1].signal.aborted).toBe(true)
      await act(async () => resolve({ ok: true, json: async () => products }))
      expect(screen.getByRole('alert')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
  it('offers retry after a failed HTTP request', async () => {
    const fetch = mockCatalog()
    fetch.mockResolvedValueOnce({ ok: false })
    const { user } = open()
    expect(await screen.findByRole('alert')).toHaveTextContent('couldn’t load')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await bagCard()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it.each([null, {}, [{ id: 1, title: 'Broken', price: -1 }], 'not json'])(
    'handles unusable catalog %j',
    async (data) => {
      mockCatalog(data)
      open()
      expect(await screen.findByRole('alert')).toBeInTheDocument()
    },
  )
  it('handles a rejected request and an empty retry', async () => {
    const fetch = mockCatalog([])
    fetch.mockRejectedValueOnce(new Error('offline'))
    const { user } = open()
    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      await screen.findByRole('heading', { name: 'No products to show yet.' }),
    ).toBeInTheDocument()
  })
  it('ignores an outdated request during StrictMode cleanup', async () => {
    const pending = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, options) =>
        new Promise((resolve) =>
          pending.push({ resolve, signal: options.signal }),
        ),
    )
    open('/shop', true)
    expect(pending[0].signal.aborted).toBe(true)
    await act(async () =>
      pending[1].resolve({ ok: true, json: async () => products }),
    )
    await bagCard()
    await act(async () =>
      pending[0].resolve({ ok: true, json: async () => [] }),
    )
    expect(
      screen.getByRole('heading', { name: 'Everyday bag' }),
    ).toBeInTheDocument()
  })
  it('renders a helpful not-found page', async () => {
    mockCatalog()
    const { user } = open('/missing')
    expect(
      screen.getByRole('heading', { name: 'This page isn’t on the shelf.' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /Back to home/ }))
    expect(
      screen.getByRole('heading', { name: /Good things/ }),
    ).toBeInTheDocument()
    expect(document.title).toBe('Home | Common Goods')
  })
})
describe('quantities and cart', () => {
  it('edits quantities, merges repeated additions, preserves state through routes, and calculates totals', async () => {
    const fetch = mockCatalog()
    const { user } = open('/')
    await user.click(
      screen.getByRole('link', { name: /Explore the collection/ }),
    )
    const card = within(await bagCard())
    const input = card.getByRole('textbox', {
      name: 'Quantity for Everyday bag',
    })
    await user.clear(input)
    await user.type(input, '2')
    await user.click(card.getByRole('button', { name: /Add to cart/ }))
    await user.click(card.getByRole('button', { name: /Add to cart/ }))
    const shirt = within(
      screen.getByRole('heading', { name: 'Cotton shirt' }).closest('article'),
    )
    await user.click(shirt.getByRole('button', { name: /Add to cart/ }))
    expect(screen.getByLabelText('5 items')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /Cart/ }))
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByText('$79.96')).toBeInTheDocument()
    expect(screen.getByText('$90.06')).toBeInTheDocument()
    const cartInput = screen.getByRole('textbox', {
      name: 'Quantity for Everyday bag',
    })
    await user.clear(cartInput)
    await user.type(cartInput, '3')
    await user.tab()
    expect(screen.getByText('$59.97')).toBeInTheDocument()
    expect(screen.getByText('$70.07')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', {
        name: 'Increase quantity for Cotton shirt',
      }),
    )
    expect(screen.getByText('$80.17')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', {
        name: 'Decrease quantity for Cotton shirt',
      }),
    )
    await user.click(screen.getByRole('link', { name: 'Home', exact: true }))
    await user.click(screen.getByRole('link', { name: /Cart/ }))
    expect(screen.getByLabelText('4 items')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      PRODUCTS_URL,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Remove Everyday bag' }),
    )
    expect(screen.getByLabelText('1 items')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Remove Cotton shirt' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Good things await.' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('0 items')).toBeInTheDocument()
    expect(document.querySelector('main')).toHaveFocus()
  })
  it('enforces boundaries and handles invalid edits predictably', async () => {
    mockCatalog()
    const { user } = open()
    const card = within(await bagCard())
    const input = card.getByRole('textbox', {
      name: 'Quantity for Everyday bag',
    })
    const minus = card.getByRole('button', { name: /Decrease/ })
    const plus = card.getByRole('button', { name: /Increase/ })
    expect(minus).toBeDisabled()
    await user.click(plus)
    expect(input).toHaveValue('2')
    for (const invalid of ['', '-4', '1.5', 'abc', '0']) {
      await user.clear(input)
      if (invalid) await user.type(input, invalid)
      await user.tab()
      expect(input).toHaveValue('2')
    }
    await user.clear(input)
    await user.type(input, '120')
    await user.keyboard('{Enter}')
    expect(input).toHaveValue('99')
    expect(plus).toBeDisabled()
    await user.click(card.getByRole('button', { name: /Add to cart/ }))
    await user.click(card.getByRole('button', { name: /Add to cart/ }))
    expect(screen.getByLabelText('99 items')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /Cart/ }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    const cartInput = screen.getByRole('textbox', {
      name: 'Quantity for Everyday bag',
    })
    await user.clear(cartInput)
    await user.type(cartInput, '1')
    await user.tab()
    expect(screen.getByRole('button', { name: /Decrease/ })).toBeDisabled()
    expect(
      within(screen.getByRole('complementary')).getByText('$19.99'),
    ).toBeInTheDocument()
  })
  it('shows an accessible fallback when an image fails', async () => {
    mockCatalog()
    open()
    const card = within(await bagCard())
    const img = card.getByRole('img', { name: 'Everyday bag' })
    act(() => img.dispatchEvent(new Event('error')))
    await waitFor(() =>
      expect(
        card.getByRole('img', { name: 'Image unavailable for Everyday bag' }),
      ).toBeInTheDocument(),
    )
  })
})
