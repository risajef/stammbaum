import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../App'

describe('application shell', () => {
  it('renders the Stammbaum heading', () => {
    render(<App />)

    expect(screen.getByText('Stammbaum')).toBeInTheDocument()
  })
})