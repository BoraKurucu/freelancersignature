import html2canvas from 'html2canvas';

/**
 * Downloads a signature as PNG image WITHOUT watermark
 * This function is for PREMIUM users only - no watermark is ever added
 * @param {HTMLElement} element - The signature element to convert
 * @param {string} filename - The filename for the downloaded image
 */
export const downloadSignatureAsPNG = async (element, filename = 'signature.png') => {
  try {
    // Wait for all images to load
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve, reject) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = resolve;
              img.onerror = reject;
              // Timeout after 5 seconds
              setTimeout(() => reject(new Error('Image load timeout')), 5000);
            }
          })
      )
    );

    // Configure html2canvas options
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to create image blob');
      }
    }, 'image/png', 0.95); // High quality
  } catch (error) {
    console.error('Error downloading signature:', error);
    throw error;
  }
};

/**
 * Adds a visible centered watermark overlay on the canvas
 * Dynamically calculates font size to fit within canvas bounds
 * @param {HTMLCanvasElement} canvas - The canvas to add watermark to
 */
export const addDiagonalWatermark = (canvas) => {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    if (!width || !height || width === 0 || height === 0) {
      console.warn('Canvas has invalid dimensions:', { width, height });
      return;
    }

    const text = 'freelancersignature.com';
    
    // Start with a reasonable base font size
    let fontSize = Math.min(width, height) * 0.15;
    const minFontSize = 16;
    const maxFontSize = 48;
    
    // Ensure font size is within bounds
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize));
    
    // Set context properties for measurement
    ctx.save();
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Measure text width
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize * 1.2; // Approximate text height
    
    // Calculate available space (leave margins)
    const marginX = width * 0.1; // 10% margin on each side
    const marginY = height * 0.1; // 10% margin on top and bottom
    const availableWidth = width - (marginX * 2);
    const availableHeight = height - (marginY * 2);
    
    // Adjust font size if text is too wide
    if (textWidth > availableWidth) {
      fontSize = (availableWidth / textWidth) * fontSize;
      fontSize = Math.max(minFontSize, fontSize);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    }
    
    // Adjust font size if text is too tall
    if (textHeight > availableHeight) {
      fontSize = (availableHeight / textHeight) * fontSize;
      fontSize = Math.max(minFontSize, fontSize);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    }
    
    // Draw watermark at the center
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Set drawing properties with reduced opacity
    ctx.globalAlpha = 0.15; // Reduced opacity for subtlety
    ctx.fillStyle = '#666666';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2; // Thinner stroke
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw stroke first (white outline), then fill (gray text)
    ctx.strokeText(text, centerX, centerY);
    ctx.fillText(text, centerX, centerY);
    
    ctx.restore();
    
    console.log('Watermark drawn:', { centerX, centerY, fontSize, width, height, textWidth });
  } catch (error) {
    console.error('Error adding watermark:', error);
  }
};

/**
 * Downloads signature with watermark for free users
 * @param {HTMLElement} element - The signature element to convert
 * @param {string} filename - The filename for the downloaded image
 */
export const downloadSignatureWithWatermark = async (element, filename = 'signature.png') => {
  try {
    // Small delay to ensure element is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    // Wait for all images to load
    const images = element.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve, reject) => {
              if (img.complete && img.naturalHeight !== 0) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Continue even if image fails
                // Timeout after 5 seconds
                setTimeout(() => resolve(), 5000);
              }
            })
        )
      );
    }

    // Ensure watermark is visible in the element
    const watermark = element.querySelector('.signature-watermark');
    if (watermark) {
      watermark.style.display = 'block';
      watermark.style.visibility = 'visible';
      watermark.style.opacity = '1';
    }

    // Capture the signature (watermark is already in the HTML at the bottom)
    const originalCanvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc, element) => {
        // Ensure watermark is visible in cloned document
        const clonedWatermark = element.querySelector('.signature-watermark');
        if (clonedWatermark) {
          clonedWatermark.style.display = 'block';
          clonedWatermark.style.visibility = 'visible';
          clonedWatermark.style.opacity = '1';
        }
      },
    });

    // Create a new canvas and copy the original image, then add watermark
    const canvas = document.createElement('canvas');
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    const ctx = canvas.getContext('2d');
    
    // Draw the original canvas onto the new canvas
    ctx.drawImage(originalCanvas, 0, 0);
    
    // Add watermark overlay to make it harder to remove/crop
    console.log('Adding watermark to canvas:', { width: canvas.width, height: canvas.height });
    addDiagonalWatermark(canvas);
    console.log('Watermark added');

    // Convert to blob and download
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
      } else {
        throw new Error('Failed to create image blob');
      }
    }, 'image/png', 0.95); // High quality
  } catch (error) {
    console.error('Error downloading signature with watermark:', error);
    throw error;
  }
};
