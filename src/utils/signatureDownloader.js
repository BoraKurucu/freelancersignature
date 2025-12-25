import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Helper to clone element and prepare it for rendering
 * This prevents "Unable to find element" errors by isolating the render target
 */
const prepareCloneForRender = async (originalElement) => {
  const clone = originalElement.cloneNode(true);
  
  // Create a wrapper to hold the clone off-screen but visible to the browser engine
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-10000px';
  container.style.left = '-10000px';
  container.style.width = originalElement.offsetWidth + 'px'; // Maintain width
  container.style.zIndex = '99999';
  
  // Ensure the clone is visible
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.style.transform = 'none'; // Remove transforms that might crop content
  
  container.appendChild(clone);
  document.body.appendChild(container);

  // Small delay to ensure the DOM updates and images inside clone load
  const images = clone.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Don't block if image fails
        setTimeout(resolve, 2000); // 2s timeout
      });
    })
  );

  return { clone, container };
};

/**
 * Downloads a signature as PNG image WITHOUT watermark
 * PREMIUM users only
 */
export const downloadSignatureAsPNG = async (element, filename = 'signature.png') => {
  let renderContext = null;

  try {
    if (!element) throw new Error('Element not found');

    // 1. Prepare the clone
    renderContext = await prepareCloneForRender(element);
    const { clone } = renderContext;

    // 2. Render the CLONE, not the original
    const canvas = await html2canvas(clone, {
      backgroundColor: null, // Transparent background if possible
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // 3. Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Error downloading PNG:', error);
    throw error;
  } finally {
    // 4. Clean up
    if (renderContext && renderContext.container) {
      document.body.removeChild(renderContext.container);
    }
  }
};

/**
 * Adds a visible centered watermark overlay on the canvas
 */
export const addDiagonalWatermark = (canvas) => {
  try {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const text = 'freelancersignature.com';
    
    let fontSize = Math.min(width, height) * 0.15;
    fontSize = Math.max(16, Math.min(48, fontSize));
    
    ctx.save();
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#666666';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    ctx.strokeText(text, centerX, centerY);
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  } catch (error) {
    console.error('Error adding watermark:', error);
  }
};

/**
 * Downloads signature with watermark for free users (PNG)
 */
export const downloadSignatureWithWatermark = async (element, filename = 'signature.png') => {
  let renderContext = null;

  try {
    if (!element) throw new Error('Element not found');

    // 1. Prepare clone
    renderContext = await prepareCloneForRender(element);
    const { clone } = renderContext;

    // Ensure watermark is visible in clone
    const watermark = clone.querySelector('.signature-watermark');
    if (watermark) {
      watermark.style.display = 'block';
      watermark.style.visibility = 'visible';
      watermark.style.opacity = '1';
    }

    // 2. Render
    const originalCanvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // 3. Process Canvas (Add overlay watermark)
    const canvas = document.createElement('canvas');
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalCanvas, 0, 0);
    
    addDiagonalWatermark(canvas);

    // 4. Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Error downloading Watermarked PNG:', error);
    throw error;
  } finally {
    if (renderContext && renderContext.container) {
      document.body.removeChild(renderContext.container);
    }
  }
};

/**
 * Downloads a signature as PDF WITHOUT watermark
 * PREMIUM users only
 */
export const downloadSignatureAsPDF = async (element, filename = 'signature.pdf') => {
  let renderContext = null;

  try {
    if (!element) throw new Error('Element not found');

    // 1. Prepare clone
    renderContext = await prepareCloneForRender(element);
    const { clone } = renderContext;

    // 2. Render
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    // Convert px to mm (approx 96 DPI)
    const pdfWidth = imgWidth * 0.264583; 
    const pdfHeight = imgHeight * 0.264583;

    // 3. Create PDF
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 4. Add Links (Calculated from CLONE)
    const links = clone.querySelectorAll('a[href]');
    const cloneRect = clone.getBoundingClientRect(); // Get rect of the cloned element

    links.forEach((link) => {
      try {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const rect = link.getBoundingClientRect();
        
        const x = (rect.left - cloneRect.left) * 0.264583;
        const y = (rect.top - cloneRect.top) * 0.264583;
        const w = rect.width * 0.264583;
        const h = rect.height * 0.264583;

        pdf.link(x, y, w, h, { url: href });
      } catch (err) {
        // ignore link errors
      }
    });

    pdf.save(filename);

  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  } finally {
    if (renderContext && renderContext.container) {
      document.body.removeChild(renderContext.container);
    }
  }
};

/**
 * Downloads signature as PDF with watermark for free users
 */
export const downloadSignatureAsPDFWithWatermark = async (element, filename = 'signature.pdf') => {
  let renderContext = null;

  try {
    console.log('[PDF Download] Starting...');
    if (!element) throw new Error('Element not found');

    // 1. Prepare clone
    renderContext = await prepareCloneForRender(element);
    const { clone } = renderContext;

    // Ensure server-side watermark is visible in the clone
    const watermark = clone.querySelector('.signature-watermark');
    if (watermark) {
      watermark.style.display = 'block';
      watermark.style.visibility = 'visible';
      watermark.style.opacity = '1';
    }

    // 2. Render
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = imgWidth * 0.264583;
    const pdfHeight = imgHeight * 0.264583;

    // 3. Create PDF
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 4. Add Links
    const links = clone.querySelectorAll('a[href]');
    const cloneRect = clone.getBoundingClientRect();

    links.forEach((link) => {
      try {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const rect = link.getBoundingClientRect();
        
        const x = (rect.left - cloneRect.left) * 0.264583;
        const y = (rect.top - cloneRect.top) * 0.264583;
        const w = rect.width * 0.264583;
        const h = rect.height * 0.264583;

        pdf.link(x, y, w, h, { url: href });
      } catch (err) {
        console.warn('Link add error', err);
      }
    });

    pdf.save(filename);
    console.log('[PDF Download] Success');

  } catch (error) {
    console.error('[PDF Download] Error:', error);
    throw error;
  } finally {
    if (renderContext && renderContext.container) {
      document.body.removeChild(renderContext.container);
    }
  }
};
