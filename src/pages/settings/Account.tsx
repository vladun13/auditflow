import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userApi } from '@/lib/api'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MinusCircle, Trash2, X, Camera } from 'lucide-react'

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({
  sectionTitle, description, label, value, onChange, onSave, saving, type = 'text', readOnly = false,
}: {
  sectionTitle: string
  description: string
  label: string
  value: string
  onChange: (v: string) => void
  onSave: () => void
  saving: boolean
  type?: string
  readOnly?: boolean
}) {
  const [original] = useState(value)
  const changed = value !== original

  return (
    <div className="grid grid-cols-2 gap-8 py-6 border-b border-gray-100 last:border-0">
      {/* Left: description */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">{sectionTitle}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      {/* Right: field */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
        <div className="flex items-center gap-3">
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            readOnly={readOnly}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-100 transition ${
              readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-200'
            }`}
          />
          {!readOnly && (
            <button
              onClick={onSave}
              disabled={!changed || saving}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                changed && !saving
                  ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ open, onClose, onConfirm, title, body, confirmLabel, icon }: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; body: string; confirmLabel: string
  icon: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-6">{body}</p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => { onClose(); onConfirm() }} className="px-5 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
              {confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Account() {
  const { user, signOut } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName]       = useState('')
  const [origName, setOrigName]       = useState('')
  const [email, setEmail]             = useState('')
  const [companyName, setCompanyName] = useState('')
  const [origCompany, setOrigCompany] = useState('')
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)

  const [savingName,    setSavingName]    = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen,     setDeleteOpen]     = useState(false)

  useEffect(() => {
    if (!user) return
    setEmail(user.email ?? '')
    userApi.getProfile().then(({ data }) => {
      if (!data) return
      const p = data as { full_name?: string; company_name?: string; avatar_url?: string }
      setFullName(p.full_name ?? '')
      setOrigName(p.full_name ?? '')
      setCompanyName(p.company_name ?? '')
      setOrigCompany(p.company_name ?? '')
      setAvatarUrl(p.avatar_url ?? null)
    })
  }, [user])

  const handleSaveName = async () => {
    setSavingName(true)
    const { error } = await userApi.updateProfile({ full_name: fullName })
    if (error) { toast.error(error) } else { toast.success('Changes saved'); setOrigName(fullName) }
    setSavingName(false)
  }

  const handleSaveCompany = async () => {
    setSavingCompany(true)
    const { error } = await userApi.updateProfile({ full_name: fullName })
    if (error) { toast.error(error) } else { toast.success('Changes saved'); setOrigCompany(companyName) }
    setSavingCompany(false)
  }

  const handleChangePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    toast.success('Photo updated')
  }

  const handleRemovePhoto = () => { setAvatarUrl(null); toast.success('Photo removed') }

  const handleDeactivate = async () => {
    toast.success('Account deactivated')
    await signOut()
  }

  const handleDelete = async () => {
    toast.success('Account deleted')
    await signOut()
  }

  const initials = (fullName || email || '?').charAt(0).toUpperCase()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Personal Details */}
      <div className="px-8 pt-7 pb-2">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Details</h2>
      </div>

      <div className="px-8">
        {/* Profile photo row */}
        <div className="grid grid-cols-2 gap-8 py-6 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Profile</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              It was popularised in the 1960s with the release of Letraset sheets containing.
            </p>
          </div>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-xl font-semibold text-[#4F46E5]">{initials}</span>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Change Photo
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Remove Photo
                </button>
              </div>
              <p className="text-xs text-gray-400">Recommended 160x160px in PNG or JPG format</p>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleChangePhoto} />
            </div>
          </div>
        </div>

        {/* Full Name */}
        <FieldRow
          sectionTitle="Full Name"
          description="It was popularised in the 1960s with the release of Letraset sheets containing."
          label="Full Name"
          value={fullName}
          onChange={v => setFullName(v)}
          onSave={handleSaveName}
          saving={savingName}
        />

        {/* Email */}
        <FieldRow
          sectionTitle="Email Address"
          description="It was popularised in the 1960s with the release of Letraset sheets containing."
          label="Email Address"
          value={email}
          onChange={() => {}}
          onSave={() => {}}
          saving={false}
          type="email"
          readOnly
        />

        {/* Company Name */}
        <FieldRow
          sectionTitle="Company Name"
          description="It was popularised in the 1960s with the release of Letraset sheets containing."
          label="Company Name"
          value={companyName}
          onChange={v => setCompanyName(v)}
          onSave={handleSaveCompany}
          saving={savingCompany}
        />
      </div>

      {/* Manage Account */}
      <div className="px-8 pt-6 pb-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Account</h2>
      </div>

      {/* Deactivate row */}
      <div className="mx-8 mb-3 rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <MinusCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Deactivate Account</p>
            <p className="text-sm text-gray-500 mt-0.5">It was popularised in the 1960s with the release of Letraset sheets containing.</p>
          </div>
        </div>
        <button onClick={() => setDeactivateOpen(true)} className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors shrink-0 ml-6">
          Deactivate
        </button>
      </div>

      {/* Delete row */}
      <div className="mx-8 mb-8 rounded-xl bg-red-50 border border-red-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Trash2 className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Delete Account</p>
            <p className="text-sm text-gray-500 mt-0.5">It was popularised in the 1960s with the release of Letraset sheets containing.</p>
          </div>
        </div>
        <button onClick={() => setDeleteOpen(true)} className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors shrink-0 ml-6">
          Delete
        </button>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Account"
        body="Are you sure you want to deactivate your account?"
        confirmLabel="Deactivate"
        icon={<MinusCircle className="h-5 w-5 text-amber-500" />}
      />
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Account"
        body="Are you sure you want to delete your account?"
        confirmLabel="Delete"
        icon={<Trash2 className="h-5 w-5 text-red-500" />}
      />
    </div>
  )
}
