import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Badge, Button, Card, CardBody, CardHeader, ErrorState, Icon, Input, Select } from '../../components'
import { todayISO } from '../../lib/dates'
import { getMockDataset } from '../../lib/mocks/dataset'
import { paths } from '../../routes/paths'
import { dispenseInventoryItem } from './api/inventoryApi'

export function InventoryDispensePage() {
  const [search] = useSearchParams()
  const studentNumber = search.get('student') ?? undefined
  const items = getMockDataset(todayISO()).inventory
  const [itemId, setItemId] = useState(items[0]?.id ?? '')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  if (!items.length) return <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-8"><ErrorState title="No inventory items available." /></div>
  async function submit(event: FormEvent) { event.preventDefault(); const amount = Number(quantity); if (!itemId || !Number.isInteger(amount) || amount < 1) { setError('Enter a whole-number quantity greater than zero.'); return } setSaving(true); setError(''); try { const result = await dispenseInventoryItem(itemId, amount, studentNumber); setSuccess(`${amount} ${result.item.unit} of ${result.item.name} recorded. Remaining stock: ${result.remainingStock}.`); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to record dispensation.') } finally { setSaving(false) } }
  return <div className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5"><div className="flex items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Dispense medicine or supply</h1><p className="mt-1 text-sm text-text-secondary">Record usage and connect it to the identified student when available.</p></div><Badge tone="warning" variant="soft" icon="package">Stock action</Badge></div>{studentNumber && <p className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-primary">Linked Student Number: {studentNumber}</p>}</Card><Card aria-labelledby="dispense-title"><CardHeader titleId="dispense-title" title="Dispensation details" icon={<Icon name="package" />} /><CardBody><form className="flex flex-col gap-4" onSubmit={submit}><Select label="Item" value={itemId} options={items.map((item) => ({ value: item.id, label: `${item.name} — ${item.currentStock} ${item.unit} available` }))} onChange={setItemId} /><Input label="Quantity" required type="number" min="1" step="1" value={quantity} onChange={(event) => { setQuantity(event.target.value); setSuccess('') }} />{error && <p role="alert" className="text-sm font-semibold text-error">{error}</p>}{success && <p role="status" className="text-sm font-semibold text-success">{success}</p>}<div className="flex flex-wrap justify-end gap-2"><a className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface" href={paths.inventory}>Cancel</a><Button type="submit" variant="primary" icon="checkCircle" loading={saving}>Record dispensation</Button></div></form></CardBody></Card></div>
  }
