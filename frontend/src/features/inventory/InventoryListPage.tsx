import { useState } from 'react'
import { Link } from 'react-router'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  Select,
  Skeleton,
  StatusBadge,
  buttonClassName,
  inventoryFlagMap,
  type DataTableColumn,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { paths } from '../../routes/paths'
import { fetchInventory, type InventoryFilters, type InventoryItemView } from './api/inventoryApi'

function InventorySkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5"><Skeleton className="h-7 w-52" /><Skeleton className="mt-2 h-4 w-96 max-w-full" /></Card>
      <Card className="p-5"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem_auto]"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10 w-36" /></div><Skeleton className="mt-5 h-64" /></Card>
    </div>
  )
}

/** Flags come computed from the data layer; this only chooses how to show them. */
function stockBadges(item: InventoryItemView) {
  return (
    <div className="flex flex-wrap gap-1">
      {item.belowZero && <Badge tone="error" variant="soft">Below zero</Badge>}
      {item.flags.map((flag) => <StatusBadge key={flag} status={flag} map={inventoryFlagMap} />)}
      {!item.belowZero && item.flags.length === 0 && <Badge tone="success" variant="soft">In stock</Badge>}
    </div>
  )
}

const columns: Array<DataTableColumn<InventoryItemView>> = [
  { key: 'name', header: 'Item', rowHeader: true, cell: (item) => item.name },
  { key: 'category', header: 'Category', cell: (item) => item.category === 'medicine' ? 'Medicine' : 'Supply' },
  { key: 'stock', header: 'Current stock', align: 'right', cell: (item) => `${item.currentStock} ${item.unit}` },
  { key: 'expiry', header: 'Expiration', cell: (item) => item.expirationDate ?? 'No expiration' },
  { key: 'status', header: 'Status', cell: stockBadges },
  { key: 'actions', header: 'Actions', cell: (item) => <Link className={buttonClassName({ variant: 'secondary', size: 'sm' })} to={`${paths.inventoryNew}?item=${encodeURIComponent(item.id)}`}>Edit</Link> },
]

export function InventoryListPage() {
  const [filters, setFilters] = useState<InventoryFilters>({ search: '', category: '' })
  const key = `${filters.search}|${filters.category}`
  const { data, status, isRefetching, reload } = useAsyncData(key, () => fetchInventory(filters))
  if (status === 'error') return <div className="mx-auto max-w-[1180px] px-4 pt-10 pb-8 sm:px-8"><ErrorState title="Unable to load inventory." onRetry={reload} /></div>
  if (!data) return <><p className="sr-only" role="status">Loading inventory...</p><InventorySkeleton /></>
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Inventory</h1><p className="mt-1 text-sm text-text-secondary">Track medicine and supplies, expiration dates, and low-stock thresholds.</p></div><Link className={buttonClassName({ variant: 'primary' })} to={paths.inventoryNew}><Icon name="package" />Add item</Link></div></Card>
      <Card aria-labelledby="inventory-list-title"><CardHeader titleId="inventory-list-title" title="Medicine and supplies" description={`${data.length} item${data.length === 1 ? '' : 's'} shown`} icon={<Icon name="package" />} /><CardBody className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-end"><Input label="Search" value={filters.search} placeholder="Item name" onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} /><Select label="Category" value={filters.category} options={[{ value: 'medicine', label: 'Medicine' }, { value: 'supply', label: 'Supply' }]} placeholder="All categories" onChange={(value) => setFilters((current) => ({ ...current, category: value as InventoryFilters['category'] }))} /><Button variant="secondary" onClick={() => setFilters({ search: '', category: '' })}>Clear filters</Button></div>
        <div aria-busy={isRefetching} className={isRefetching ? 'opacity-60' : undefined}>{data.length ? <DataTable caption="Inventory items" columns={columns} rows={data} rowKey={(item) => item.id} /> : <EmptyState icon="package" title="No inventory items found" description="Try a different search or category." />}</div>
      </CardBody></Card>
    </div>
  )
}
