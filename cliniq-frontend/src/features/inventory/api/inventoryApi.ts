import {
  dispenseInventoryItem as dispenseInLayer,
  getInventoryItem,
  listInventory,
  saveInventoryItem as saveInLayer,
  type DispenseResult,
  type InventoryItemView,
  type SessionUser,
} from '../../../lib/mock-db'
import type { InventoryCategory, InventoryItem } from '../../../types/entities'

/**
 * Inventory (#28–#30). Low-stock, nearing-expiration, expired, and below-zero states are computed
 * by the data layer on every read (`InventoryItemView`), never stored and never recomputed here, so
 * the list, the dispense form, and the Dashboard's alerts always agree.
 */
export type { InventoryItemView }

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
}

export function fetchInventory(filters: InventoryFilters): Promise<InventoryItemView[]> {
  return listInventory(filters)
}

export async function fetchInventoryForm(itemId?: string): Promise<InventoryFormContext> {
  return { item: itemId ? await getInventoryItem(itemId) : null }
}

export function saveInventoryItem(
  values: InventoryFormValues,
  options: { itemId?: string; actor?: SessionUser },
): Promise<InventoryItem> {
  return saveInLayer(
    {
      name: values.name.trim(),
      category: values.category,
      currentStock: Number(values.currentStock),
      unit: values.unit.trim(),
      expirationDate: values.expirationDate || null,
      lowStockThreshold: Number(values.lowStockThreshold),
    },
    options,
  )
}

/** Decrements stock; going below zero warns but never blocks recording care (Module 8). */
export function dispenseInventoryItem(
  itemId: string,
  quantity: number,
  studentNumber?: string,
  actor?: SessionUser,
): Promise<DispenseResult> {
  return dispenseInLayer(itemId, quantity, { studentNumber }, actor)
}
