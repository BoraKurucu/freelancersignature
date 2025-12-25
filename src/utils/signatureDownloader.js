import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 1. GÜNCEL WATERMARK: Taşma ve merkezleme sorunu düzeltildi.
 */
const drawProfessionalWatermark = (canvas) => {
  const ctx = canvas.getContext('2d');
  const text = 'freelancersignature.com';
  
  const fontSize = Math.max(12, canvas.width * 0.025); 
  ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; 
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textWidth = ctx.measureText(text).width;
  const spacingX = textWidth * 2.2; 
  const spacingY = fontSize * 6;    

  ctx.save();
  // Merkeze odakla ve çevir
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 12); 

  const coverage = Math.sqrt(canvas.width**2 + canvas.height**2);
  
  for (let y = -coverage / 2; y < coverage / 2; y += spacingY) {
    const shiftX = (Math.round(y / spacingY) % 2 === 0) ? 0 : spacingX / 2;
    for (let x = -coverage / 2; x < coverage / 2; x += spacingX) {
      ctx.fillText(text, x + shiftX, y);
    }
  }
  ctx.restore();
};

/**
 * 2. GELİŞMİŞ KOPYALAMA: E-posta istemcilerinde bozulmayı önler.
 */
export const copySignatureToClipboard = async (element) => {
  if (!element) return { success: false, message: "Element bulunamadı." };

  try {
    const htmlContent = element.innerHTML;
    const textContent = element.innerText;

    const blobHtml = new Blob([htmlContent], { type: "text/html" });
    const blobText = new Blob([textContent], { type: "text/plain" });

    const data = [
      new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      }),
    ];

    await navigator.clipboard.write(data);
    return { success: true, message: "İmza başarıyla kopyalandı!" };
  } catch (err) {
    // Fallback logic
    try {
      const range = document.createRange();
      range.selectNode(element);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      return { success: true, message: "Kopyalandı (Tarayıcı kısıtlaması nedeniyle düz kopyalama yapıldı)." };
    } catch (fallbackErr) {
      return { success: false, message: "Kopyalama başarısız." };
    }
  }
};

/**
 * RENDER YARDIMCISI: Login gerektirmez, doğrudan DOM'dan çeker.
 */
const getSignatureCanvas = async (element, addWatermark) => {
  const clone = element.cloneNode(true);
  const container = document.createElement('div');
  
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: element.offsetWidth + 'px',
    zIndex: '-9999',
    pointerEvents: 'none',
    background: 'white'
  });
  
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.transform = 'none';
  
  container.appendChild(clone);
  document.body.appendChild(container);

  // Resim bekleme süresini 5 saniyeye çıkardık (Daha güvenli)
  const images = clone.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 5000); 
      });
    })
  );

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff', /* Şeffaf yerine beyaz zorla (Siyah ekranı engeller) */
      scale: 2, /* Yüksek kalite (3'ten 2'ye düşürdük performans için) */
      useCORS: true, /* Resimlerin yüklenmesi için */
      allowTaint: true,
      logging: false,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });

    if (addWatermark) {
      drawProfessionalWatermark(canvas);
    }

    return { canvas, clone, container };
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
};

// ================= DIŞA AKTARILAN API =================

/**
 * PNG İNDİR (Watermark yok, login gerektirmez)
 */
export const downloadSignatureAsPNG = async (element, filename = 'signature.png') => {
  const { canvas, container } = await getSignatureCanvas(element, false);
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * WATERMARKLI PNG İNDİR (Login gerektirmez)
 */
export const downloadSignatureWithWatermark = async (element, filename = 'signature_protected.png') => {
  const { canvas, container } = await getSignatureCanvas(element, true);
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * PDF İNDİR: Link kayma sorunları giderildi.
 */
export const downloadSignatureAsPDF = async (element, filename = 'signature.pdf', hasWatermark = false) => {
  const { canvas, clone, container } = await getSignatureCanvas(element, hasWatermark);
  
  try {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pxToMm = 0.264583;
    
    const pdfWidth = (canvas.width / 3) * pxToMm;
    const pdfHeight = (canvas.height / 3) * pxToMm;

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'l' : 'p',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Link koordinatlarını hassas hesapla
    const cloneRect = clone.getBoundingClientRect();
    const ratio = pdfWidth / cloneRect.width;

    clone.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const linkRect = link.getBoundingClientRect();
      const x = (linkRect.left - cloneRect.left) * ratio;
      const y = (linkRect.top - cloneRect.top) * ratio;
      const w = linkRect.width * ratio;
      const h = linkRect.height * ratio;

      pdf.link(x, y, w, h, { url: href });
    });

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
};

// Watermarklı PDF için kısa yol
export const downloadSignatureAsPDFWithWatermark = (element, filename = 'signature_protected.pdf') => {
  return downloadSignatureAsPDF(element, filename, true);
};
