import html2canvas from 'html2canvas';

/**
 * Downloads a signature as PNG image
 * @param {HTMLElement} element - The signature element to convert
 * @param {string} filename - The filename for the downloaded image
 * @param {boolean} showWatermark - Whether to show watermark in the image
 */
export const downloadSignatureAsPNG = async (element, filename = 'signature.png', showWatermark = false) => {
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
 * Adds watermark overlay to a canvas element
 * @param {HTMLCanvasElement} canvas - The canvas to add watermark to
 * @param {string} text - Watermark text
 */
export const addWatermarkToCanvas = (canvas, text = 'Created with FreelancerSignature') => {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Set watermark style - make it visible but not intrusive
  ctx.save();
  
  // Add white background for better visibility
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  const watermarkHeight = 40;
  ctx.fillRect(0, height - watermarkHeight, width, watermarkHeight);
  
  // Add border at top of watermark area
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height - watermarkHeight);
  ctx.lineTo(width, height - watermarkHeight);
  ctx.stroke();
  
  // Watermark text - centered at bottom
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#999999';
  ctx.font = '10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Add only the watermark text at bottom center (no URL)
  const watermarkY = height - 20;
  ctx.fillText(`✨ ${text}`, width / 2, watermarkY);

  ctx.restore();
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
    const canvas = await html2canvas(element, {
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

    // No overlay watermark - only the HTML watermark at the bottom is used

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
