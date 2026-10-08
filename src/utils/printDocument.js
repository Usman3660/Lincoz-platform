/**
 * Dedicated Document Printing Utility
 * Isolates printable content into a clean iframe to prevent parent layout clipping,
 * dark-theme bleeding, and blank-page overflow issues common with window.print().
 */

export const printElement = (elementId, documentTitle = 'Financial Statement') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Print Error: Element #${elementId} not found.`);
    // Fallback to native print if element cannot be found
    window.print();
    return;
  }

  // Create an isolated, hidden iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute(
    'style',
    'position: fixed; width: 0; height: 0; left: -9999px; top: -9999px; border: 0; visibility: hidden;'
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // Clone all styles and link tags from current document to preserve Tailwind CSS styling
  const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${documentTitle}</title>
        ${styleNodes}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            overflow: visible !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div class="printable-root">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Allow browser a moment to apply styles and load font assets
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Print execution failed:', err);
    } finally {
      // Remove temporary iframe after printing dialog is closed/canceled
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        } catch (e) {
          // ignore cleanup errors
        }
      }, 2000);
    }
  }, 300);
};
