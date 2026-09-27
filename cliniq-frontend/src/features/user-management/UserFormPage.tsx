import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, CardBody, CardHeader, Icon, Input, Select } from '../../components'
import { recordMockAudit } from '../../lib/mocks/audit'
import { getMockSessionUser } from '../../lib/mocks/session'

export function UserFormPage({ userId }: { userId?: string }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('staff')
  const [saved, setSaved] = useState(false)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !username.trim()) return
    const user = getMockSessionUser()
    recordMockAudit({ userId: user.id, actionType: userId ? 'update' : 'create', targetRecord: { type: 'user', id: userId ?? `mock-user-${Date.now()}` }, timestamp: new Date().toISOString() })
    setSaved(true)
  }
  return <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 py-6 sm:px-8"><Card><CardHeader title={userId ? 'Edit user' : 'Add user'} description="Assign the smallest role needed for the person's work." icon={<Icon name="userCog" />} /><CardBody><form className="flex flex-col gap-4" onSubmit={submit} noValidate><Input label="Full name" value={name} required onChange={(event) => setName(event.target.value)} /><Input label="Username" value={username} required onChange={(event) => setUsername(event.target.value)} /><Select label="Role" value={role} options={[{ value: 'staff', label: 'School Clinician' }, { value: 'admin', label: 'Admin / Principal' }, { value: 'instructor', label: 'PE/Sports Instructor' }]} onChange={setRole} /><p className="text-xs text-text-secondary">Passwords are provisioned through the future Sanctum account workflow and are never displayed here.</p><div className="flex flex-wrap justify-end gap-2"><Button variant="neutral" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" variant="primary">{userId ? 'Save changes' : 'Create user'}</Button></div>{saved && <p role="status" className="rounded-md border border-success bg-success/10 px-3 py-2 text-sm font-semibold text-text-primary">User saved and audit event recorded.</p>}</form></CardBody></Card></main>
}
