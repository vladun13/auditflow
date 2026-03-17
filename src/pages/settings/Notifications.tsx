import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Pref { id: string; label: string; description: string; enabled: boolean }

const DEFAULTS: Pref[] = [
  { id: 'scan_complete',  label: 'Scan completed',       description: 'Get notified when your accessibility scan finishes.', enabled: true },
  { id: 'weekly_summary', label: 'Weekly summary',        description: 'Receive a weekly digest of your audit activity.',     enabled: false },
  { id: 'low_credits',    label: 'Low credit warning',    description: 'Alert when your credit balance drops below 2.',       enabled: true },
  { id: 'promotions',     label: 'Promotional emails',    description: 'News about new features, tips, and special offers.',  enabled: false },
]

export function Notifications() {
  const [prefs, setPrefs] = useState<Pref[]>(DEFAULTS)
  const [saving, setSaving] = useState(false)

  const toggle = (id: string) =>
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500)) // replace with real API call
    toast.success('Notification preferences saved')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Control which emails you receive from AuditFlow</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6 divide-y divide-border">
          {prefs.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex-1 pr-8">
                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pref.enabled}
                onClick={() => toggle(pref.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${pref.enabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save preferences'}
      </Button>
    </div>
  )
}
