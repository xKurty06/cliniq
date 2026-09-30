import { Link } from 'react-router'
import { formatDateTime } from '../../lib/dates'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  Icon,
  Skeleton,
  buttonClassName,
  type DataTableColumn,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { ROLE_LABELS } from '../../lib/mock-db'
import { paths } from '../../routes/paths'
import type { User } from '../../types/entities'
import { fetchUsers } from './api/userApi'

const columns: Array<DataTableColumn<User>> = [
  { key: 'name', header: 'Name', rowHeader: true, cell: (user) => user.name },
  { key: 'username', header: 'Username', cell: (user) => user.username },
  {
    key: 'role',
    header: 'Role',
    cell: (user) => (
      <Badge tone="neutral" variant="soft">
        {ROLE_LABELS[user.role]}
      </Badge>
    ),
  },
  {
    key: 'lastLogin',
    header: 'Last login',
    cell: (user) => (user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'),
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (user) => (
      <Link
        className={buttonClassName({ variant: 'secondary', size: 'sm' })}
        to={paths.userEdit(user.id)}
      >
        Edit
      </Link>
    ),
  },
]
function UserListSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-page-wide flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </Card>
      <Card className="p-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="mt-3 h-8 w-full" />
        ))}
      </Card>
    </div>
  )
}

export function UserListPage() {
  const { data: users, status, reload } = useAsyncData('users', fetchUsers)
  if (status === 'error')
    return (
      <div className="mx-auto max-w-page-wide px-4 pt-10 pb-8 sm:px-8">
        <ErrorState title="Unable to load user accounts." onRetry={reload} />
      </div>
    )
  if (!users)
    return (
      <>
        <p className="sr-only" role="status">
          Loading user accounts...
        </p>
        <UserListSkeleton />
      </>
    )
  return (
    <div className="mx-auto flex max-w-page-wide flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">User Management</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Manage accounts and role assignments for the clinic team.
            </p>
          </div>
          <Link className={buttonClassName({ variant: 'primary' })} to={paths.userNew}>
            <Icon name="userCog" />
            Add User
          </Link>
        </div>
      </Card>
      <Card aria-labelledby="users-title">
        <CardHeader
          titleId="users-title"
          title="Accounts"
          description={`${users.length} account${users.length === 1 ? '' : 's'}`}
          icon={<Icon name="userCog" />}
        />
        <CardBody>
          {users.length ? (
            <DataTable
              caption="User accounts"
              columns={columns}
              rows={users}
              rowKey={(user) => user.id}
            />
          ) : (
            <EmptyState icon="userCog" title="No user accounts" description="Add the first account." />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
