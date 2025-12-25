import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Helper: Clone element and prepare it for rendering
 * Off-screen container içinde temiz bir kopya oluşturur.
 */
const prepareCloneForRender = async (originalElement) => {
  const clone = originalElement.cloneNode(true);
  const container = document.createElement('div');
  
  // Container ayarları: Görünmez ama render edilebilir alan
  container.style.position = 'fixed';
  container.style.top = '0'; // -10000px yerine 0 verip z-index ile arkaya atıyoruz, bazen html2canvas negatif koordinatta sapıtabiliyor.
  container.style.left = '0';
  container.style.width = originalElement.offsetWidth + 'px';
  container.style.zIndex = '-9999'; // Kullanıcı görmesin
  container.style.overflow = 'visible'; // Kırpılmayı önle
  
  // Clone ayarları
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.style.transform = 'none';
  clone.style.margin = '0'; // Margin sıfırla ki koordinatlar kaymasın
  
  container.appendChild(clone);
  document.body.appendChild(container);

  // Resimlerin yüklenmesini bekle
  const images = clone.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 2000); // 3sn çok uzun, 2sn yeterli
      });
    })
  );

  return { clone, container };
};

/**
 * Helper: Add Watermark directly to Canvas Context
 * Bu fonksiyon hem PNG hem PDF akışında ortak kullanılır.
 */
const drawWatermarkOnCanvas = (canvas) => {
  const ctx = canvas.getContext('2d');
  const text = 'freelancersignature.com';
  
  // Canvas boyutuna göre font büyüklüğü ayarla
  const fontSize = Math.max(24, canvas.width * 0.06); 
  
  ctx.save(); // Mevcut durumu kaydet
  
  ctx.globalAlpha = 0.4; // Görünürlüğü artırdım (0.15 çok silikti)
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = '#808080';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Çapraz yazdırmak için
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 6); // -30 derece döndür
  ctx.fillText(text, 0, 0);
  
  ctx.restore(); // Durumu geri yükle
};

/**
 * Core: Canvas Generation Logic
 * HTML -> Canvas dönüşümünü tek bir yerde yapıyoruz.
 */
const generateCanvas = async (element, addWatermark) => {
  let renderContext = null;
  try {
    renderContext = await prepareCloneForRender(element);
    const { clone } = renderContext;

    // html2canvas ayarları
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff', // Şeffaf olmasın, PDF'te siyah çıkabilir
      scale: 2, // Retina kalitesi
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight
    });

    // Eğer watermark isteniyorsa, canvas oluştuğu an üzerine çiziyoruz
    if (addWatermark) {
      drawWatermarkOnCanvas(canvas);
    }

    // Link haritalaması için clone referansını da döndürüyoruz
    return { canvas, clone, container: renderContext.container };

  } catch (error) {
    if (renderContext) document.body.removeChild(renderContext.container);
    throw error;
  }
};

// ================= EXPORTED FUNCTIONS =================

export const downloadSignatureAsPNG = async (element, filename = 'signature.png') => {
  // Watermark: false
  const { canvas, container } = await generateCanvas(element, false);
  
  try {
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
    document.body.removeChild(container);
  }
};

export const downloadSignatureWithWatermark = async (element, filename = 'signature.png') => {
  // Watermark: true
  const { canvas, container } = await generateCanvas(element, true);
  
  try {
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
    document.body.removeChild(container);
  }
};

export const downloadSignatureAsPDF = async (element, filename = 'signature.pdf') => {
  await createPDF(element, filename, false);
};

export const downloadSignatureAsPDFWithWatermark = async (element, filename = 'signature.pdf') => {
  await createPDF(element, filename, true);
};

/**
 * Common PDF Logic
 */
const createPDF = async (element, filename, addWatermark) => {
  const { canvas, clone, container } = await generateCanvas(element, addWatermark);

  try {
    const imgData = canvas.toDataURL('image/png');

    // 1. Boyut Hesaplama (En kritik kısım burası)
    // Canvas pixel genişliği
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    
    // Pixel'den MM'ye çevrim (html2canvas scale 2 olduğu için ona bölebiliriz veya direkt canvas boyutunu kullanabiliriz)
    // Standart: 1px = 0.264583 mm (96 DPI'da).
    // Ancak biz scale:2 ile aldık. PDF'e scale:2 halini sığdıracağız.
    const pxToMm = 0.264583;
    
    // PDF sayfa boyutunu tam olarak resmin boyutuna ayarlıyoruz (A4 değil, Custom Format)
    // Resmin scale:2 boyutunu baz alırsak çok büyük çıkar, orijinal elementin boyutuna sadık kalalım.
    const pdfWidthMm = (imgWidthPx / 2) * pxToMm;
    const pdfHeightMm = (imgHeightPx / 2) * pxToMm;

    // 2. jsPDF Başlatma
    const pdf = new jsPDF({
      orientation: pdfWidthMm > pdfHeightMm ? 'l' : 'p',
      unit: 'mm',
      format: [pdfWidthMm, pdfHeightMm], // Sayfayı tam imza boyutunda yap
      compress: true
    });

    // 3. Resmi Ekle
    // Sayfanın (0,0) noktasına, sayfa genişliği ve yüksekliği kadar bas
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm);

    // 4. Linkleri Eşle (Mapping)
    const cloneRect = clone.getBoundingClientRect();
    const ratioW = pdfWidthMm / cloneRect.width;
    const ratioH = pdfHeightMm / cloneRect.height;

    const links = clone.querySelectorAll('a[href]');
    links.forEach((link) => {
      try {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const rect = link.getBoundingClientRect();
        
        // Kordinat hesaplama (Clone üzerindeki konumu)
        const x = (rect.left - cloneRect.left) * ratioW;
        const y = (rect.top - cloneRect.top) * ratioH;
        const w = rect.width * ratioW;
        const h = rect.height * ratioH;

        pdf.link(x, y, w, h, { url: href });
      } catch (err) {
        // Sessizce geç
      }
    });

    pdf.save(filename);

  } finally {
    document.body.removeChild(container);
  }
};
