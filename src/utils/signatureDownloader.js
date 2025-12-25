import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 1. WATERMARK: CSS'deki gibi ince ve şık görünsün
 */
const drawProfessionalWatermark = (canvas) => {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Canvas context alınamadı');
      return;
    }
    
    const text = 'freelancersignature.com';
    
    // Canvas boyutlarını kontrol et
    if (!canvas.width || !canvas.height) {
      console.error('❌ Canvas boyutları geçersiz:', canvas.width, canvas.height);
      return;
    }
    
    console.log('✅ Watermark çiziliyor - Canvas:', canvas.width, 'x', canvas.height);
    
    // CSS'DEKİ GİBİ KÜÇÜK VE İNCE OLSUN
    // ÖNEMLİ: CSS'de font-size: 10px, scale:2 olduğu için 20px yapıyoruz
    const fontSize = 20; // CSS'deki 10px * 2 (scale)
    ctx.font = `normal ${fontSize}px Arial, sans-serif`; // bold değil normal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // ÇOK DAHA AÇIK RENK - CSS'deki gibi
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // CSS'DEKİ GİBİ 4x6 GRID OLSUN
    const cols = 4;
    const rows = 6;
    
    // Her bir hücrenin boyutları
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    // Rotasyon açısı: CSS'de -45 derece
    const angle = -45 * Math.PI / 180;
    
    // Her hücreye watermark çiz
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // CSS'deki gibi opak ve ince
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillText(text, 0, 0);
        
        ctx.restore();
      }
    }
    
    console.log('✅ CSS gibi watermark çizildi - Grid:', cols, 'x', rows, 'Font:', fontSize, 'px');
  } catch (error) {
    console.error('❌ Watermark çizim hatası:', error);
  }
};

/**
 * RENDER YARDIMCISI: Sadece canvas üzerine çiz, CSS'den karmaşıklığı kaldır
 */
const getSignatureCanvas = async (element, addWatermark) => {
  const signatureElement = element.querySelector('.tpl-modern-vertical') || 
                           element.querySelector('.signature-preview-container') ||
                           element.querySelector('.signature-preview') ||
                           element;
  
  const clone = signatureElement.cloneNode(true);
  
  // ÖNEMLİ: CSS watermark elementlerini KALDIR
  const watermarkElements = clone.querySelectorAll('.watermark-grid, .watermark-item');
  watermarkElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  
  const container = document.createElement('div');
  
  Object.assign(container.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: signatureElement.offsetWidth + 'px',
    margin: '0',
    padding: '0',
    background: '#ffffff',
    overflow: 'hidden'
  });
  
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.display = 'inline-block';
  
  container.appendChild(clone);
  document.body.appendChild(container);

  // Resimlerin yüklendiğinden emin ol
  const images = Array.from(clone.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      img.setAttribute('crossOrigin', 'anonymous');
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  await new Promise(r => setTimeout(r, 200));

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // 2x kalite
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: clone.offsetWidth,
      height: clone.offsetHeight,
    });

    // SADECE canvas üzerine watermark çiz - CSS yok
    if (addWatermark) {
      console.log('Canvas üzerine ince watermark çiziliyor...');
      drawProfessionalWatermark(canvas);
    }

    return { canvas, clone, container };
  } catch (error) {
    console.error('Canvas oluşturma hatası:', error);
    if (container.parentNode) document.body.removeChild(container);
    throw error;
  }
};

/**
 * PDF İNDİR: Watermark'ı dahil ederek çıktı alır.
 */
export const downloadSignatureAsPDF = async (element, filename = 'signature.pdf', hasWatermark = false) => {
  const { canvas, clone, container } = await getSignatureCanvas(element, hasWatermark);
  
  try {
    // ÖNEMLİ: Watermark çizildikten SONRA dataURL alıyoruz
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    const widthPx = canvas.width / 2;
    const heightPx = canvas.height / 2;
    const mmWidth = widthPx * 0.264583;
    const mmHeight = heightPx * 0.264583;

    const pdf = new jsPDF({
      orientation: mmWidth > mmHeight ? 'l' : 'p',
      unit: 'mm',
      format: [mmWidth, mmHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);

    // Linkler
    const ratio = mmWidth / clone.offsetWidth;
    clone.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const rect = link.getBoundingClientRect();
      const cloneRect = clone.getBoundingClientRect();
      pdf.link((rect.left - cloneRect.left) * ratio, (rect.top - cloneRect.top) * ratio, rect.width * ratio, rect.height * ratio, { url: href });
    });

    pdf.save(filename);
  } finally {
    if (container.parentNode) document.body.removeChild(container);
  }
};

/**
 * PNG İNDİR: Watermark'ı dahil ederek çıktı alır.
 */
export const downloadSignatureWithWatermark = async (element, filename = 'signature_protected.png') => {
  const { canvas, container } = await getSignatureCanvas(element, true);
  try {
    // Watermark'ın çizildiğinden emin ol - canvas'ı kontrol et
    console.log('PNG indirme - Canvas boyutları:', canvas.width, 'x', canvas.height);
    
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    // DataURL'in boş olmadığını kontrol et
    if (!dataUrl || dataUrl === 'data:,') {
      console.error('Canvas dataURL boş!');
      throw new Error('Canvas dataURL alınamadı');
    }
    
    console.log('DataURL alındı, uzunluk:', dataUrl.length);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('PNG indirme hatası:', error);
    throw error;
  } finally {
    if (container.parentNode) document.body.removeChild(container);
  }
};

// Diğer fonksiyonlar (Standart)
export const downloadSignatureAsPNG = async (element, filename = 'signature.png') => {
  const { canvas, container } = await getSignatureCanvas(element, false);
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } finally {
    if (container.parentNode) document.body.removeChild(container);
  }
};

export const downloadSignatureAsPDFWithWatermark = (element, filename = 'signature_protected.pdf') => {
  return downloadSignatureAsPDF(element, filename, true);
};

export const copySignatureToClipboard = async (element) => {
  if (!element) return { success: false, message: "Element bulunamadı." };
  try {
    const blobHtml = new Blob([element.innerHTML], { type: "text/html" });
    const blobText = new Blob([element.innerText], { type: "text/plain" });
    const data = [new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText })];
    await navigator.clipboard.write(data);
    return { success: true, message: "İmza kopyalandı!" };
  } catch (err) {
    return { success: false, message: "Kopyalama başarısız." };
  }
};
