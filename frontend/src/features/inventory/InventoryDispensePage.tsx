import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, ErrorState, Icon, Input, Select, Skeleton } from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { paths } from '../../routes/paths'
import { dispenseInventoryItem, fetchInventory } from './api/inventoryApi'

function DispenseSkeleton() {
  return <div aria-hidden="true" className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8"><Card className="p-5"><Skeleton className="h-7 w-64" /><Skeleton className="mt-2 h-4 w-80 max-w-full" /></Card><Card className="p-5"><Skeleton className="h-12" /><Skeleton className="mt-4 h-12" /><div className="mt-4 flex justify-end gap-2"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-44" /></div></Card></div>
}

export function InventoryDispensePage() {
  const [search] = useSearchParams()
  const studentNumber = search.get('student') ?? undefined
  const { data: items, status, reload } = useAsyncData('dispense-items', () => fetchInventory({ search: '', category: '' }))
  const [chosenId, setChosenId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  if (status === 'error') return <div className="mx-auto max-w-[760px] px-4 pt-10 pb-8 sm:px-8"><ErrorState title="Unable to load inventory items." onRetry={reload} /></div>
  if (!items) return <><p className="sr-only" role="status">Loading inventory items...</p><DispenseSkeleton /></>
  if (!items.length) return <div className="mx-auto max-w-[760px] px-4 pt-10 pb-8 sm:px-8"><EmptyState icon="package" title="No inventory items available" description="Add an item on the Inventory page before recording a dispensation." /></div>
  const itemId = chosenId || items[0].id
  async function submit(event: FormEvent) { event.preventDefault(); const amount = Number(quantity); if (!itemId || !Number.isInteger(amount) || amount < 1) { setError('Enter a whole-number quantity greater than zero.'); return } setSaving(true); setError(''); try { const result = await dispenseInventoryItem(itemId, amount, studentNumber); setSuccess(`${amount} ${result.item.unit} of ${result.item.name} recorded. Remaining stock: ${result.remainingStock}.${result.belowZero ? ' Stock is now below zero; recount and restock.' : ''}`); reload() } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to record dispensation.') } finally { setSaving(false) } }
  return <div className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8"><Card className="p-5"><div className="flex items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Dispense medicine or supply</h1><p className="mt-1 text-sm text-text-secondary">Record usage and connect it to the identified student when available.</p></div><Badge tone="warning" variant="soft" icon="package">Stock action</Badge></div>{studentNumber && <p className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-primary">Linked Student Number: {studentNumber}</p>}</Card><Card aria-labelledby="dispense-title"><CardHeader titleId="dispense-title" title="Dispensation details" icon={<Icon name="package" />} /><CardBody><form className="flex flex-col gap-4" onSubmit={submit}><Select label="Item" value={itemId} options={items.map((item) => ({ value: item.id, label: `${item.name} — ${item.currentStock} ${item.unit} available` }))} onChange={setChosenId} /><Input label="Quantity" required type="number" min="1" step="1" value={quantity} onChange={(event) => { setQuantity(event.target.value); setSuccess('') }} />{error && <p role="alert" className="text-sm font-semibold text-error">{error}</p>}{success && <p role="status" className="text-sm font-semibold text-success">{success}</p>}<div className="flex flex-wrap justify-end gap-2"><a className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface" href={paths.inventory}>Cancel</a><Button type="submit" variant="primary" icon="checkCircle" loading={saving}>Record dispensation</Button></div></form></CardBody></Card></div>
}
