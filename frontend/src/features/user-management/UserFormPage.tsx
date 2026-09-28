import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, CardBody, CardHeader, ErrorState, Icon, Input, Select, Skeleton } from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { getMockSessionUser } from '../../lib/mock-db'
import type { UserRole } from '../../types/entities'
import { fetchUser, submitUser } from './api/userApi'

export function UserFormPage({ userId }: { userId?: string }) {
  const { data: existing, status } = useAsyncData(`user|${userId ?? 'new'}`, () =>
    userId ? fetchUser(userId) : Promise.resolve(null),
  )
  if (status === 'error') return <ErrorState title="Unable to load this account." />
  if (existing === undefined) return <FormSkeleton />
  return <UserForm key={existing?.id ?? 'new'} userId={userId} initial={existing} />
}

function FormSkeleton() {
  return (
    <>
      <p className="sr-only" role="status">
        Loading account...
      </p>
      <div aria-hidden="true" className="mx-auto max-w-[760px] px-4 pt-10 pb-8 sm:px-8">
        <Card className="p-5">
          <Skeleton className="h-7 w-40" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="mt-4 h-12" />
          ))}
        </Card>
      </div>
    </>
  )
}

function UserForm({
  userId,
  initial,
}: {
  userId?: string
  initial: { name: string; username: string; role: UserRole } | null
}) {
  const navigate = useNavigate()
  const [name, setName] = useState(initial?.name ?? '')
  const [username, setUsername] = useState(initial?.username ?? '')
  const [role, setRole] = useState<UserRole>(initial?.role ?? 'staff')
  const [saved, setSaved] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !username.trim()) return
    await submitUser({ name, username, role }, { userId, actor: getMockSessionUser() })
    setSaved(true)
  }
  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card>
        <CardHeader
          title={userId ? 'Edit user' : 'Add user'}
          description="Assign the smallest role needed for the person's work."
          icon={<Icon name="userCog" />}
        />
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <Input
              label="Full name"
              value={name}
              required
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              label="Username"
              value={username}
              required
              onChange={(event) => setUsername(event.target.value)}
            />
            <Select
              label="Role"
              value={role}
              options={[
                { value: 'staff', label: 'School Clinician' },
                { value: 'admin', label: 'Admin / Principal' },
                { value: 'instructor', label: 'PE/Sports Instructor' },
              ]}
              onChange={(value) => setRole(value as UserRole)}
            />
            <p className="text-xs text-text-secondary">
              Passwords are provisioned through the future Sanctum account workflow and are never
              displayed here.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="neutral" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {userId ? 'Save changes' : 'Create user'}
              </Button>
            </div>
            {saved && (
              <p
                role="status"
                className="rounded-md border border-success bg-success/10 px-3 py-2 text-sm font-semibold text-text-primary"
              >
                User saved and audit event recorded.
              </p>
            )}
          </form>
        </CardBody>
      </Card>
    </main>
  )
}
