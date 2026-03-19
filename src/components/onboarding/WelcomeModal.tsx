import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WelcomeModalProps {
  open: boolean
  onStart: () => void
  onClose: () => void
}

function AuditIllustration() {
  return (
    <svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-auto">
      <circle cx="80" cy="90" r="45" fill="#597EF7" />
      <text x="80" y="104" textAnchor="middle" fill="white" fontSize="44" fontWeight="bold">+</text>
      <rect x="120" y="28" width="82" height="102" rx="6" fill="white" />
      <rect x="132" y="48" width="58" height="6" rx="3" fill="#D6E4FF" />
      <rect x="132" y="62" width="58" height="6" rx="3" fill="#D6E4FF" />
      <rect x="132" y="76" width="58" height="6" rx="3" fill="#D6E4FF" />
      <rect x="132" y="90" width="40" height="6" rx="3" fill="#D6E4FF" />
      <circle cx="188" cy="118" r="20" fill="#2F54EB" />
      <path d="M180 118l6 6 12-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="108" y="24" width="50" height="22" rx="6" fill="#F6FFED" />
      <text x="133" y="39" textAnchor="middle" fill="#389E0D" fontSize="12" fontWeight="600">FREE</text>
    </svg>
  )
}

export function WelcomeModal({ open, onStart, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="p-0 gap-0 max-w-sm overflow-hidden rounded-2xl border-0 shadow-xl">
        {/* Illustration area */}
        <div className="bg-[#D6E4FF] flex items-center justify-center h-48 rounded-t-2xl">
          <AuditIllustration />
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-6 flex flex-col gap-4">
          <div className="text-center">
            <p className="font-semibold text-base text-foreground">
              You can perform one audit at no cost
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Start your first scan free. Each subsequent scan uses 1 credit.
            </p>
          </div>

          <Button
            className="w-full rounded-full h-10 text-white font-medium"
            style={{ backgroundColor: '#2F54EB' }}
            onClick={onStart}
          >
            Let&apos;s Get Started!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
