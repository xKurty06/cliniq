import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'
import type { InventoryCategory, InventoryItem } from '../../../types/entities'

export interface InventoryFilters {
  search: string
  category: '' | InventoryCategory
}

export interface InventoryFormValues {
  name: string
  category: InventoryCategory
  currentStock: string
  unit: string
  expirationDate: string
  lowStockThreshold: string
}

export interface InventoryFormContext {
  item: InventoryItem | null
  nextId: string
}

export async function fetchInventory(filters: InventoryFilters): Promise<InventoryItem[]> {
  const dataset = getMockDataset(todayISO())
  const search = filters.search.trim().toLowerCase()
  return dataset.inventory.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search)
    const matchesCategory = !filters.category || item.category === filters.category
    return matchesSearch && matchesCategory
  })
}

export async function fetchInventoryForm(itemId?: string): Promise<InventoryFormContext> {
  const inventory = getMockDataset(todayISO()).inventory
  return {
    item: itemId ? inventory.find((item) => item.id === itemId) ?? null : null,
    nextId: `inv-${inventory.length + 1}`,
  }
}

export async function saveInventoryItem(
  values: InventoryFormValues,
  options: { itemId?: string },
): Promise<InventoryItem> {
  const item: InventoryItem = {
    id: options.itemId ?? `inv-new-${Date.now()}`,
    name: values.name.trim(),
    category: values.category,
    currentStock: Number(values.currentStock),
    unit: values.unit.trim(),
    expirationDate: values.expirationDate || null,
    lowStockThreshold: Number(values.lowStockThreshold),
  }
  recordMockAudit({
    userId: 'usr-nurse',
    actionType: options.itemId ? 'update' : 'create',
    targetRecord: { type: 'inventory', id: item.id },
    timestamp: new Date().toISOString(),
  })
  return item
}

export async function dispenseInventoryItem(
  itemId: string,
  quantity: number,
  studentNumber?: string,
): Promise<{ item: InventoryItem; remainingStock: number; belowZero: boolean }> {
  const item = getMockDataset(todayISO()).inventory.find((candidate) => candidate.id === itemId)
  if (!item) throw new Error('Inventory item not found')
  const remainingStock = item.currentStock - quantity
  recordMockAudit({
    userId: 'usr-nurse',
    actionType: 'submit',
    targetRecord: { type: 'inventory-dispensation', id: `${item.id}:${studentNumber ?? 'unlinked'}` },
    timestamp: new Date().toISOString(),
  })
  return { item, remainingStock, belowZero: remainingStock < 0 }
}
