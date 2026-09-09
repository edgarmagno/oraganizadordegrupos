import html2pdf from 'html2pdf.js';

export interface GeneratePdfOptions {
  elementId: string;
  fileName: string;
  margin?: number;
}

export function downloadPdfFromElement({
  elementId,
  fileName,
  margin = 8,
}: GeneratePdfOptions): Promise<void> {
  // Native print window opens instantly, never freezes or hangs the browser,
  // and allows saving directly as vector-crisp PDF ("Salvar como PDF").
  triggerBrowserPrint();
  return Promise.resolve();
}

/**
 * Trigger native print dialog for the print container
 */
export function triggerBrowserPrint(): void {
  window.print();
}

