import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Basit ve etkili watermark çizimi
 */
const drawSimpleWatermark = (canvas) => {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context alınamadı');
      return;
    }
    
    console.log('Watermark çizimi başlıyor - Canvas:', canvas.width, 'x', canvas.height);
    
    // Asıl watermark'ı çiz
    ctx.save();
    ctx.globalCompositeOperation = 'source-over'; // Normal çizim
    
    const text = 'freelancersignature.com';
    const fontSize = 38; // Daha büyük font
    ctx.font = `normal ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(128, 128, 128, 0.15)'; // Gri renk, daha şeffaf
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Canvas boyutlarına göre grid oluştur - DAHA DA SEYREK
    const cols = Math.ceil(canvas.width / 320); // Her 320 pikselde bir (daha seyrek)
    const rows = Math.ceil(canvas.height / 240); // Her 240 pikselde bir (daha seyrek)
    
    console.log(`Watermark çiziliyor: ${cols}x${rows} grid, Font: ${fontSize}px`);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i * 320) + 160;
        const y = (j * 240) + 120;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.785); // -45 derece = -π/4 ≈ -0.785 radyan
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
    
    ctx.restore();
    
    console.log('✅ Watermark çizildi');
  } catch (error) {
    console.error('Watermark çizim hatası:', error);
  }
};

/**
 * Element'ten canvas oluşturma (basitleştirilmiş)
 */
const getCanvasFromElement = async (element, addWatermark = false) => {
  console.log('Canvas oluşturuluyor...');
  
  // Element'i clone'la
  const clone = element.cloneNode(true);
  
  // ÖNEMLİ: Tüm resimlere crossOrigin ekle - Canvas tainted olmasını önle
  const images = clone.querySelectorAll('img');
  images.forEach(img => {
    if (img.src && !img.src.startsWith('data:')) {
      img.setAttribute('crossOrigin', 'anonymous');
      img.crossOrigin = 'anonymous';
    }
  });
  
  const container = document.createElement('div');
  
  // Container stilini ayarla
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.background = '#ffffff';
  container.style.padding = '20px';
  container.style.zIndex = '9999';
  
  container.appendChild(clone);
  document.body.appendChild(container);
  
  // Resimlerin yüklenmesini bekle
  await Promise.all(
    Array.from(clone.querySelectorAll('img')).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 2000); // 2 saniye timeout
      });
    })
  );
  
  // Kısa bekleme - render için
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    // html2canvas ile canvas oluştur - YÜKSEK KALİTE için scale artırıldı
    const canvas = await html2canvas(clone, {
      scale: 3, // Yüksek kalite için 3x scale
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false, // Log'ları kapat
      width: clone.offsetWidth,
      height: clone.offsetHeight,
    });
    
    console.log(`Canvas oluşturuldu: ${canvas.width}x${canvas.height}`);
    
    // Watermark ekle - ÖNEMLİ: Canvas render edildikten SONRA
    if (addWatermark) {
      console.log('Watermark ekleniyor...');
      
      // Kısa bir bekleme - canvas'ın tam render olması için
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ÖNEMLİ: Yeni bir canvas oluştur, orijinal canvas'ı kopyala, sonra watermark ekle
      // Bu şekilde watermark kesinlikle en üstte olacak
      const newCanvas = document.createElement('canvas');
      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;
      const newCtx = newCanvas.getContext('2d');
      
      // Orijinal canvas'ı yeni canvas'a kopyala
      newCtx.drawImage(canvas, 0, 0);
      
      // Watermark'ı yeni canvas'a çiz
      drawSimpleWatermark(newCanvas);
      
      // Orijinal canvas'ı yeni canvas ile değiştir
      canvas.width = newCanvas.width;
      canvas.height = newCanvas.height;
      const finalCtx = canvas.getContext('2d');
      finalCtx.drawImage(newCanvas, 0, 0);
      
      console.log('✅ Watermark canvas\'a eklendi');
    }
    
    return { canvas, container, clone };
  } catch (error) {
    console.error('Canvas oluşturma hatası:', error);
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    throw error;
  }
};

/**
 * PNG İndirme (watermark ile)
 */
export const downloadSignaturePNG = async (element, filename, isPremiumUser = false) => {
  console.log(`PNG indirme başlatıldı. Premium: ${isPremiumUser}`);
  
  // Premium kullanıcı için watermark YOK, free için watermark VAR
  const addWatermark = !isPremiumUser;
  
  const { canvas, container } = await getCanvasFromElement(element, addWatermark);
  
  try {
    // Watermark zaten getCanvasFromElement içinde çizildi
    
    // toDataURL'i try-catch ile dene - tainted canvas hatası yakalamak için
    let dataUrl;
    try {
      dataUrl = canvas.toDataURL('image/png', 1.0);
    } catch (taintedError) {
      console.error('❌ Canvas tainted hatası!', taintedError);
      throw new Error('Canvas tainted - CORS sorunu. Resimler crossOrigin ile yüklenmeli.');
    }
    
    if (!dataUrl || dataUrl === 'data:,') {
      console.error('❌ Canvas dataURL boş!');
      throw new Error('Canvas dataURL alınamadı');
    }
    
    console.log('✅ DataURL alındı, uzunluk:', dataUrl.length, 'İlk 100 karakter:', dataUrl.substring(0, 100));
    
    const link = document.createElement('a');
    link.download = filename || 'signature.png';
    link.href = dataUrl;
    link.click();
    
    console.log('PNG indirildi');
  } catch (error) {
    console.error('PNG indirme hatası:', error);
    
    // Canvas tainted hatası ise kullanıcıya bilgi ver
    if (error.message && error.message.includes('tainted')) {
      console.error('❌ Canvas tainted - CORS sorunu olabilir');
    }
    
    throw error;
  } finally {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

/**
 * PDF İndirme (watermark ile)
 */
export const downloadSignaturePDF = async (element, filename, isPremiumUser = false) => {
  console.log(`PDF indirme başlatıldı. Premium: ${isPremiumUser}`);
  
  // Premium kullanıcı için watermark YOK, free için watermark VAR
  const addWatermark = !isPremiumUser;
  
  const { canvas, container, clone } = await getCanvasFromElement(element, addWatermark);
  
  try {
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // PDF boyutlarını hesapla (mm cinsinden)
    // Scale 3 kullandığımız için canvas.width gerçek boyutun 3 katı
    // PDF'te gerçek boyutu kullanmak için scale'e bölüyoruz
    const actualWidth = canvas.width / 3;
    const actualHeight = canvas.height / 3;
    const mmWidth = (actualWidth * 0.264583); // px to mm
    const mmHeight = (actualHeight * 0.264583);
    
    const pdf = new jsPDF({
      orientation: mmWidth > mmHeight ? 'l' : 'p',
      unit: 'mm',
      format: [mmWidth, mmHeight]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);
    
    // ÖNEMLİ: Linkleri PDF'e ekle
    if (clone) {
      const ratio = mmWidth / clone.offsetWidth;
      const cloneRect = clone.getBoundingClientRect();
      
      // Tüm linkleri bul ve ekle (duplicate'leri önlemek için Set kullan)
      const processedLinks = new Set();
      const links = clone.querySelectorAll('a[href]');
      
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || processedLinks.has(link)) return;
        
        processedLinks.add(link);
        
        const rect = link.getBoundingClientRect();
        const x = (rect.left - cloneRect.left) * ratio;
        const y = (rect.top - cloneRect.top) * ratio;
        const w = rect.width * ratio;
        const h = rect.height * ratio;
        
        // jsPDF link ekleme
        try {
          pdf.link(x, y, w, h, { url: href });
        } catch (linkError) {
          console.warn('Link eklenemedi:', href, linkError);
        }
      });
      
      console.log(`✅ ${processedLinks.size} link PDF'e eklendi`);
    }
    
    pdf.save(filename || 'signature.pdf');
    
    console.log('PDF indirildi');
  } catch (error) {
    console.error('PDF indirme hatası:', error);
    throw error;
  } finally {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

/**
 * Debug için: Canvas'ı ekranda göster
 */
export const debugCanvas = async (element, addWatermark = false) => {
  const { canvas, container } = await getCanvasFromElement(element, addWatermark);
  
  // Canvas'ı ekranda göster
  canvas.style.position = 'fixed';
  canvas.style.top = '50px';
  canvas.style.left = '50px';
  canvas.style.border = '2px solid red';
  canvas.style.zIndex = '10000';
  canvas.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
  document.body.appendChild(canvas);
  
  // 10 saniye sonra kaldır
  setTimeout(() => {
    if (canvas.parentNode) document.body.removeChild(canvas);
    if (container.parentNode) document.body.removeChild(container);
  }, 10000);
  
  return canvas;
};
