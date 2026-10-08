var e=(e,t=`Financial Statement`)=>{let n=document.getElementById(e);if(!n){console.error(`Print Error: Element #${e} not found.`),window.print();return}let r=document.createElement(`iframe`);r.setAttribute(`style`,`position: fixed; width: 0; height: 0; left: -9999px; top: -9999px; border: 0; visibility: hidden;`),document.body.appendChild(r);let i=r.contentWindow.document,a=Array.from(document.querySelectorAll(`style, link[rel="stylesheet"]`)).map(e=>e.outerHTML).join(`
`);i.open(),i.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${t}</title>
        ${a}
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
          ${n.innerHTML}
        </div>
      </body>
    </html>
  `),i.close(),setTimeout(()=>{try{r.contentWindow.focus(),r.contentWindow.print()}catch(e){console.error(`Print execution failed:`,e)}finally{setTimeout(()=>{try{r.parentNode&&document.body.removeChild(r)}catch{}},2e3)}},300)};export{e as t};