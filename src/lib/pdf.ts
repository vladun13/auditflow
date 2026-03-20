import html2pdf from 'html2pdf.js'

export async function generatePdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css'] },
  }

  await html2pdf().from(element).set(options).save()
}
