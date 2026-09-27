import { Link } from 'react-router'
import { Badge, Card, CardBody, CardHeader, DataTable, Icon, buttonClassName, type DataTableColumn } from '../../components'
import { paths } from '../../routes/paths'
import type { User } from '../../types/entities'

const users: User[] = [
  { id: 'usr-nurse', name: 'Ms. Jenne Baas', username: 'jenne.baas', role: 'staff', lastLogin: '2026-09-27T08:10:00+08:00' },
  { id: 'usr-principal', name: 'Principal', username: 'principal', role: 'admin', lastLogin: '2026-09-26T16:12:00+08:00' },
  { id: 'usr-pe', name: 'PE Instructor', username: 'pe.instructor', role: 'instructor', lastLogin: null },
]
const columns: Array<DataTableColumn<User>> = [
  { key: 'name', header: 'Name', rowHeader: true, cell: (user) => user.name },
  { key: 'username', header: 'Username', cell: (user) => user.username },
  { key: 'role', header: 'Role', cell: (user) => <Badge tone="neutral" variant="soft">{user.role === 'admin' ? 'Admin / Principal' : user.role === 'staff' ? 'School Clinician' : 'PE/Sports Instructor'}</Badge> },
  { key: 'lastLogin', header: 'Last login', cell: (user) => user.lastLogin?.slice(0, 16).replace('T', ' ') ?? 'Never' },
  { key: 'actions', header: 'Actions', cell: (user) => <Link className={buttonClassName({ variant: 'secondary', size: 'sm' })} to={paths.userEdit(user.id)}>Edit</Link> },
]
export function UserListPage() { return <main className="mx-auto flex max-w-[1100px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">User Management</h1><p className="mt-1 text-sm text-text-secondary">Manage accounts and role assignments for the clinic team.</p></div><Link className={buttonClassName({ variant: 'primary' })} to={paths.userNew}><Icon name="userCog" />Add user</Link></div></Card><Card aria-labelledby="users-title"><CardHeader titleId="users-title" title="Accounts" description={`${users.length} account${users.length === 1 ? '' : 's'}`} icon={<Icon name="userCog" />} /><CardBody><DataTable caption="User accounts" columns={columns} rows={users} rowKey={(user) => user.id} /></CardBody></Card></main> }
