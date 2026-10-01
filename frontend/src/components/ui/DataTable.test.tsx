import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataTable } from './DataTable'

describe('DataTable sortable headers', () => {
  it('uses the shared accessible sort-control treatment', () => {
    render(
      <DataTable
        caption="Sortable records"
        fixedLayout
        columns={[
          {
            key: 'name',
            header: 'Name',
            rowHeader: true,
            cell: (row: { name: string }) => row.name,
            sort: { label: 'Name', direction: 'ascending', onSort: vi.fn() },
          },
        ]}
        rows={[{ name: 'Amina' }]}
        rowKey={(row) => row.name}
      />,
    )

    expect(screen.getByRole('button', { name: 'Sort by Name, currently ascending' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('table', { name: 'Sortable records' })).toHaveClass('table-fixed')
    expect(screen.getByRole('table').querySelector('caption')).toHaveClass('sr-only')
  })
})
