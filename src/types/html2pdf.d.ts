declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: { type?: string; quality?: number }
    html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean }
    jsPDF?: { unit?: string; format?: string; orientation?: string }
    pagebreak?: {
      mode?: string | string[]
      before?: string | string[]
      after?: string | string[]
      avoid?: string | string[]
    }
    enableLinks?: boolean
  }

  interface Html2PdfWorker {
    from(element: HTMLElement | string, type?: string): Html2PdfWorker
    set(options: Html2PdfOptions): Html2PdfWorker
    save(filename?: string): Promise<void>
    toPdf(): Html2PdfWorker
    toCanvas(): Html2PdfWorker
    toImg(): Html2PdfWorker
    toContainer(): Html2PdfWorker
    then(callback: (value: unknown) => void): Html2PdfWorker
    output(type: string, options?: Record<string, unknown>): Promise<unknown>
    get(key: string): Promise<unknown>
  }

  function html2pdf(): Html2PdfWorker
  function html2pdf(
    element: HTMLElement,
    options?: Html2PdfOptions,
  ): Promise<void>

  export default html2pdf
}
