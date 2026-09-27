import { beforeEach, describe, expect, it } from 'vitest'
import { clearMockAuditEntries, getMockAuditEntries } from '../../../lib/mocks/audit'
import { dispenseInventoryItem, fetchInventory } from './inventoryApi'

describe('inventory mock API', () => {
  beforeEach(() => clearMockAuditEntries())

  it('filters the inventory list by search and category', async () => {
    const medicines = await fetchInventory({ search: 'acid', category: 'medicine' })
    expect(medicines.map((item) => item.name)).toEqual(['Mefenamic Acid 250mg'])
  })

  it('records a dispensation and allows stock to cross below zero with a warning result', async () => {
    const result = await dispenseInventoryItem('inv-1', 20, '2026-00001')
    expect(result.remainingStock).toBe(-8)
    expect(result.belowZero).toBe(true)
    expect(getMockAuditEntries()).toHaveLength(1)
    expect(getMockAuditEntries()[0].actionType).toBe('submit')
  })
})
