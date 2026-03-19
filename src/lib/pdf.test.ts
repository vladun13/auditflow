import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSave, mockSet, mockFrom, mockHtml2pdf } = vi.hoisted(() => {
  const mockSave = vi.fn().mockResolvedValue(undefined)
  const mockSet = vi.fn().mockReturnValue({ save: mockSave })
  const mockFrom = vi.fn().mockReturnValue({ set: mockSet })
  const mockHtml2pdf = vi.fn().mockReturnValue({ from: mockFrom })
  return { mockSave, mockSet, mockFrom, mockHtml2pdf }
})

vi.mock('html2pdf.js', () => ({
  default: mockHtml2pdf,
}))

import { generatePdf } from './pdf'

describe('generatePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSave.mockResolvedValue(undefined)
    mockSet.mockReturnValue({ save: mockSave })
    mockFrom.mockReturnValue({ set: mockSet })
    mockHtml2pdf.mockReturnValue({ from: mockFrom })
  })

  it('calls html2pdf factory function', async () => {
    const element = document.createElement('div')
    await generatePdf(element, 'test-report.pdf')

    expect(mockHtml2pdf).toHaveBeenCalledOnce()
  })

  it('calls .from() with the provided DOM element', async () => {
    const element = document.createElement('div')
    await generatePdf(element, 'test-report.pdf')

    expect(mockFrom).toHaveBeenCalledWith(element)
  })

  it('calls .set() with correct A4 options including filename', async () => {
    const element = document.createElement('div')
    await generatePdf(element, 'auditflow-report-abc123.pdf')

    expect(mockSet).toHaveBeenCalledOnce()
    const options = mockSet.mock.calls[0][0]

    expect(options.filename).toBe('auditflow-report-abc123.pdf')
    expect(options.margin).toEqual([10, 10, 10, 10])
    expect(options.jsPDF.format).toBe('a4')
    expect(options.jsPDF.orientation).toBe('portrait')
    expect(options.html2canvas.scale).toBe(2)
    expect(options.pagebreak.mode).toContain('avoid-all')
  })

  it('calls .save() to trigger download', async () => {
    const element = document.createElement('div')
    await generatePdf(element, 'test-report.pdf')

    expect(mockSave).toHaveBeenCalledOnce()
  })

  it('rejects when html2pdf throws an error', async () => {
    mockSave.mockRejectedValueOnce(new Error('Canvas rendering failed'))
    const element = document.createElement('div')

    await expect(generatePdf(element, 'test.pdf')).rejects.toThrow(
      'Canvas rendering failed',
    )
  })
})
