import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export function Account() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    const { data } = await userApi.getProfile()
    if (data) {
      const profile = data as { full_name?: string }
      setFullName(profile.full_name || '')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await userApi.updateProfile({ full_name: fullName })
    if (error) {
      toast.error(error)
    } else {
      toast.success('Profile updated')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Account</h2>
        <p className="text-sm text-muted-foreground">Update your personal information</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email changes are managed through Supabase auth.</p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40 bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-destructive mb-1">Danger zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive" size="sm" disabled>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
