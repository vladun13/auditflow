import { useState, useMemo } from "react"
import { X, Settings2, CheckCircle2, Clock } from "lucide-react"

// ── Thumbnail designs ─────────────────────────────────────────────────────────

function PageThumbnail({ type }: { type: number }) {
  if (type === 0) return (
    <div className="w-full h-full bg-slate-900 overflow-hidden">
      <div className="h-5 flex items-center px-2 gap-1.5 border-b border-white/10">
        <div className="w-10 h-1.5 rounded bg-white/80" />
        <div className="flex-1" />
        <div className="w-4 h-1 rounded bg-white/30" />
        <div className="w-4 h-1 rounded bg-white/30" />
        <div className="w-7 h-2.5 rounded bg-indigo-500" />
      </div>
      <div className="px-3 py-2 text-center bg-slate-800">
        <div className="w-3/5 h-2.5 rounded bg-white/80 mx-auto mb-1" />
        <div className="w-4/5 h-1 rounded bg-white/30 mx-auto mb-0.5" />
        <div className="w-1/3 h-4 rounded bg-indigo-500 mx-auto mt-2" />
      </div>
      <div className="p-2 grid grid-cols-3 gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="bg-slate-700/60 rounded p-1.5 h-10">
            <div className="w-4 h-3 rounded bg-indigo-400/40 mb-1" />
            <div className="w-full h-1 rounded bg-white/20 mb-0.5" />
            <div className="w-2/3 h-1 rounded bg-white/10" />
          </div>
        ))}
      </div>
      <div className="px-2 pb-1">
        <div className="w-full h-1 rounded bg-white/10 mb-0.5" />
        <div className="w-3/4 h-1 rounded bg-white/10 mb-0.5" />
        <div className="w-5/6 h-1 rounded bg-white/10" />
      </div>
    </div>
  )

  if (type === 1) return (
    <div className="w-full h-full bg-gray-100 overflow-hidden flex">
      <div className="bg-slate-900 w-9 flex-shrink-0 p-1.5">
        <div className="w-5 h-2 rounded bg-white/80 mb-2" />
        {[0,1,2,3,4].map(i => (
          <div key={i} className={`h-2.5 rounded mb-1 ${i===0 ? "bg-indigo-500" : "bg-white/15"}`} />
        ))}
      </div>
      <div className="flex-1 p-1.5 overflow-hidden">
        <div className="bg-white rounded-md h-7 mb-1.5 p-1.5 shadow-sm border border-gray-200/80">
          <div className="w-1/3 h-1.5 rounded bg-gray-400 mb-1" />
          <div className="flex gap-1">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-1 h-2.5 rounded bg-indigo-50 border border-indigo-100" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} className="bg-white rounded-md h-10 p-1.5 shadow-sm border border-gray-200/60">
              <div className="w-full h-1 rounded bg-gray-200 mb-1" />
              <div className="w-2/3 h-4 rounded bg-indigo-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (type === 2) return (
    <div className="w-full h-full bg-white overflow-hidden">
      <div className="border-b border-gray-100 h-5 flex items-center px-2 gap-1.5">
        <div className="w-9 h-1.5 rounded bg-gray-900" />
        <div className="flex-1" />
        <div className="w-4 h-1 rounded bg-gray-300" />
        <div className="w-4 h-1 rounded bg-gray-300" />
        <div className="w-6 h-2.5 rounded bg-indigo-500" />
      </div>
      <div className="px-2 py-2 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-1/2 h-2.5 rounded bg-indigo-900 mx-auto mb-1" />
        <div className="w-3/4 h-1 rounded bg-indigo-300 mx-auto mb-0.5" />
        <div className="w-1/4 h-3 rounded bg-indigo-500 mx-auto mt-1.5" />
      </div>
      <div className="p-1.5">
        <div className="w-1/3 h-1 rounded bg-gray-300 mb-1.5 mx-auto" />
        <div className="grid grid-cols-3 gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="border border-gray-100 rounded p-1 bg-gray-50">
              <div className="w-full h-5 rounded bg-gray-200 mb-1" />
              <div className="w-full h-1 rounded bg-gray-200 mb-0.5" />
              <div className="w-2/3 h-1 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="px-2">
        <div className="w-full h-1 rounded bg-gray-100 mb-0.5" />
        <div className="w-full h-1 rounded bg-gray-100 mb-0.5" />
        <div className="w-3/4 h-1 rounded bg-gray-100" />
      </div>
    </div>
  )

  if (type === 3) return (
    <div className="w-full h-full bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 h-5 flex items-center px-2 gap-1.5">
        <div className="w-7 h-1.5 rounded bg-gray-900" />
        <div className="flex-1" />
        <div className="w-4 h-3.5 rounded-full bg-gray-200" />
      </div>
      <div className="flex overflow-hidden" style={{ height: "calc(100% - 20px)" }}>
        <div className="w-9 bg-white border-r border-gray-100 p-1.5 flex-shrink-0">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`h-2 rounded mb-1 ${i===1 ? "bg-indigo-500" : "bg-gray-100"}`} />
          ))}
        </div>
        <div className="flex-1 p-1.5 overflow-hidden">
          <div className="bg-white rounded border border-gray-200 p-1.5 mb-1.5">
            <div className="w-1/3 h-1.5 rounded bg-gray-400 mb-1.5" />
            {[0,1,2].map(i => (
              <div key={i} className="mb-1">
                <div className="w-1/4 h-1 rounded bg-gray-300 mb-0.5" />
                <div className="w-full h-2.5 rounded border border-gray-200 bg-gray-50" />
              </div>
            ))}
          </div>
          <div className="flex gap-1 justify-end">
            <div className="w-8 h-3 rounded border border-gray-200 bg-white" />
            <div className="w-10 h-3 rounded bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  )

  if (type === 4) return (
    <div className="w-full h-full bg-white overflow-hidden">
      <div className="border-b border-gray-100 h-5 flex items-center px-2 gap-1.5">
        <div className="w-7 h-1.5 rounded bg-gray-900" />
        <div className="flex-1" />
        <div className="w-4 h-1 rounded bg-gray-300" />
        <div className="w-4 h-1 rounded bg-gray-300" />
      </div>
      <div className="px-3 py-2">
        <div className="w-1/4 h-1.5 rounded bg-indigo-400 mb-1" />
        <div className="w-4/5 h-2.5 rounded bg-gray-900 mb-1" />
        <div className="w-1/3 h-1 rounded bg-gray-300 mb-2" />
        <div className="w-full h-8 rounded bg-gray-100 mb-2" />
        <div className="w-full h-1 rounded bg-gray-200 mb-0.5" />
        <div className="w-full h-1 rounded bg-gray-200 mb-0.5" />
        <div className="w-3/4 h-1 rounded bg-gray-200 mb-0.5" />
        <div className="w-full h-1 rounded bg-gray-200 mb-0.5" />
        <div className="w-5/6 h-1 rounded bg-gray-200" />
      </div>
    </div>
  )

  // type 5: Pricing
  return (
    <div className="w-full h-full bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-100 h-5 flex items-center px-2 gap-1.5">
        <div className="w-7 h-1.5 rounded bg-gray-900" />
        <div className="flex-1" />
        <div className="w-6 h-2.5 rounded bg-indigo-500" />
      </div>
      <div className="p-2 text-center">
        <div className="w-1/2 h-2.5 rounded bg-gray-800 mx-auto mb-1" />
        <div className="w-3/5 h-1 rounded bg-gray-300 mx-auto mb-2" />
        <div className="flex gap-1.5 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className={`flex-1 rounded border p-1.5 ${i===1 ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-gray-200 bg-white"}`}>
              <div className="w-1/2 h-1 rounded bg-gray-300 mb-1 mx-auto" />
              <div className="w-2/3 h-3 rounded bg-gray-700 mb-1 mx-auto" />
              <div className="w-full h-1 rounded bg-gray-200 mb-0.5" />
              <div className="w-full h-1 rounded bg-gray-200 mb-1" />
              <div className="w-full h-2.5 rounded bg-indigo-500 mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  url: string
  depth: number
  onSave: (selectedCount: number) => void
}

export function PreviewModal({ open, onClose, url, depth, onSave }: PreviewModalProps) {
  const SLUGS = [
    { path: "/", title: "Home" },
    { path: "/about", title: "About" },
    { path: "/pricing", title: "Pricing" },
    { path: "/features", title: "Features" },
    { path: "/blog", title: "Blog" },
    { path: "/contact", title: "Contact" },
    { path: "/docs", title: "Documentation" },
    { path: "/faq", title: "FAQ" },
    { path: "/team", title: "Team" },
  ]

  const base = url.replace(/\/$/, "") || "https://example.com"
  const totalPages = Math.min(depth * 2 + 1, SLUGS.length)

  const pages = useMemo(
    () => SLUGS.slice(0, totalPages).map((s, i) => ({
      id: i.toString(),
      url: base + s.path,
      title: s.title,
      type: i % 6,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, totalPages]
  )

  // Default: select first `depth` pages
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(pages.slice(0, depth).map((p) => p.id))
  )

  const selectedCount = selected.size
  const estimatedMinutes = Math.max(1, Math.round(selectedCount * 1.5))
  const estimatedTime = estimatedMinutes >= 60
    ? `${Math.round(estimatedMinutes / 60)}h`
    : `${estimatedMinutes}m`
  const hasChanges = selectedCount !== depth || ![...selected].every((id) => parseInt(id) < depth)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    onSave(selectedCount)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Preview</h2>
            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-xl">{base}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mt-0.5 ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex justify-center px-6 pb-3 flex-shrink-0">
          <div className="inline-flex items-center gap-5 bg-gray-900 text-white rounded-full px-5 py-2.5 text-xs font-medium shadow-lg">
            <span className="flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-gray-400" />
              All pages:
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-white text-gray-900 text-[10px] font-bold px-1">
                {totalPages}
              </span>
            </span>
            <span className="w-px h-3 bg-white/20" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              Selected pages to scan:
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-white text-gray-900 text-[10px] font-bold px-1">
                {selectedCount}
              </span>
            </span>
            <span className="w-px h-3 bg-white/20" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              Estimated scan time:
              <span className="font-bold">{estimatedTime}</span>
            </span>
          </div>
        </div>

        {/* Page grid */}
        <div className="overflow-y-auto flex-1 px-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {pages.map((page) => {
              const isSelected = selected.has(page.id)
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => toggle(page.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left group ${
                    isSelected
                      ? "border-[#4F46E5] shadow-[0_0_0_3px_rgba(79,70,229,0.12)]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ aspectRatio: "4/3" }}
                >
                  {/* Thumbnail */}
                  <div className="absolute inset-0">
                    <PageThumbnail type={page.type} />
                  </div>

                  {/* Checkbox overlay */}
                  <div
                    className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-10 ${
                      isSelected
                        ? "bg-[#4F46E5] border-[#4F46E5]"
                        : "bg-white/90 border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>

                  {/* URL label at bottom */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pt-4 pb-2 z-10">
                    <p className="text-white text-[10px] font-medium truncate">{page.url}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-6 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedCount === 0}
            className={`h-10 px-6 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              hasChanges && selectedCount > 0
                ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm"
                : selectedCount === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
