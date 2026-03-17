import { useState } from 'react'
import { userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

function PasswordInput({
  id, label, value, onChange
}: {
  id: string; label: string; value: string; onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export function Security() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next !== confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (next.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    const { error } = await userApi.updatePassword(current, next)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Password updated')
      setCurrent(''); setNext(''); setConfirm('')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">Manage your password and account security</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Change password</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <PasswordInput id="current" label="Current password" value={current} onChange={setCurrent} />
            <PasswordInput id="new" label="New password" value={next} onChange={setNext} />
            <PasswordInput id="confirm" label="Confirm new password" value={confirm} onChange={setConfirm} />
            <Button type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">Two-factor authentication</h3>
          <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account.</p>
          <Button variant="outline" disabled>Enable 2FA (coming soon)</Button>
        </CardContent>
      </Card>
    </div>
  )
}
