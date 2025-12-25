import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Helper to clone element and prepare it for rendering
 */
const prepareCloneForRender = async (originalElement) => {
  const clone = originalElement.cloneNode(true);
  const container = document.createElement('div');
  
  container.style.position = 'fixed';
  container.style.top = '-10000px';
  container.style.left = '-10000px';
  container.style.width = originalElement.offsetWidth + 'px';
  container.style.zIndex = '99999';
  
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.style.transform = 'none'; 
  
  container.appendChild(clone);
  document.body.appendChild(container);

  const images = clone.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 3000); 
      });
    })
  );

  return { clone, container };
};

/**
 * Common Logic for PDF Generation with Links
 */
const generatePDFWithLinks = async (clone, filename) => {
  const canvas = await html2canvas(clone, {
    backgroundColor: '#ffffff',
    scale: 2, // High resolution
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  
  // 1. Calculate dimensions
  // Since scale is 2, the canvas is twice the size of the element.
  // We want the PDF to match the visual size of the element in mm.
  const pxToMm = 0.264583;
  const cloneRect = clone.getBoundingClientRect();
  
  const pdfWidth = cloneRect.width * pxToMm;
  const pdfHeight = cloneRect.height * pxToMm;

  // 2. Initialize PDF
  const pdf = new jsPDF({
    orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pdfWidth, pdfHeight]
  });

  // 3. Add Image
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  // 4. Map Links
  // We calculate a ratio to map HTML coordinates to PDF units
  const ratio = pdfWidth / cloneRect.width;

  const links = clone.querySelectorAll('a[href]');
  links.forEach((link) => {
    try {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const rect = link.getBoundingClientRect();

      // Position relative to the signature container
      const x = (rect.left - cloneRect.left) * ratio;
      const y = (rect.top - cloneRect.top) * ratio;
      const w = rect.width * ratio;
      const h = rect.height * ratio;

      pdf.link(x, y, w, h, { url: href });
    } catch (err) {
      console.warn('Link mapping failed:', err);
    }
  });

  pdf.save(filename);
};

export const downloadSignatureAsPNG = async (element, filename = 'signature.png') => {
  let renderContext = null;
  try {
    renderContext = await prepareCloneForRender(element);
    const canvas = await html2canvas(renderContext.clone, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } finally {
    if (renderContext) document.body.removeChild(renderContext.container);
  }
};

export const downloadSignatureWithWatermark = async (element, filename = 'signature.png') => {
  let renderContext = null;
  try {
    renderContext = await prepareCloneForRender(element);
    const { clone } = renderContext;
    
    const watermark = clone.querySelector('.signature-watermark');
    if (watermark) watermark.style.display = 'block';

    const originalCanvas = await html2canvas(clone, { scale: 2, useCORS: true });
    
    const canvas = document.createElement('canvas');
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalCanvas, 0, 0);
    
    // Manual diagonal watermark overlay
    const text = 'freelancersignature.com';
    const fontSize = Math.max(20, canvas.width * 0.05);
    ctx.globalAlpha = 0.15;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } finally {
    if (renderContext) document.body.removeChild(renderContext.container);
  }
};

export const downloadSignatureAsPDF = async (element, filename = 'signature.pdf') => {
  let renderContext = null;
  try {
    renderContext = await prepareCloneForRender(element);
    await generatePDFWithLinks(renderContext.clone, filename);
  } finally {
    if (renderContext) document.body.removeChild(renderContext.container);
  }
};

export const downloadSignatureAsPDFWithWatermark = async (element, filename = 'signature.pdf') => {
  let renderContext = null;
  try {
    renderContext = await prepareCloneForRender(element);
    const { clone } = renderContext;
    
    const watermark = clone.querySelector('.signature-watermark');
    if (watermark) {
      watermark.style.display = 'block';
      watermark.style.visibility = 'visible';
    }

    await generatePDFWithLinks(clone, filename);
  } finally {
    if (renderContext) document.body.removeChild(renderContext.container);
  }
};
