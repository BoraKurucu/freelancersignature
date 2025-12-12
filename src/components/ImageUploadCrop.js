import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageUploadCrop.css';

const ImageUploadCrop = ({ 
  value, 
  onChange, 
  disabled = false,
  label = 'Image',
  placeholder = 'https://example.com/image.jpg',
  hint = '',
  fieldName = 'photoUrl',
  aspectRatio = 1 // Default to square (1:1), set to null/undefined for free aspect
}) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: aspectRatio });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSrc(reader.result);
        setShowCropModal(true);
        // Reset crop to default with all required values
        setCrop({ 
          unit: '%', 
          x: 5,
          y: 5,
          width: 90, 
          height: aspectRatio ? 90 : undefined,
          aspect: aspectRatio 
        });
        setCompletedCrop(null); // Reset completed crop, will be set when image loads
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoaded = useCallback((e) => {
    const img = e.currentTarget;
    imgRef.current = img;
    
    // Calculate default crop based on image dimensions
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    
    // Set default crop to cover most of the image (centered)
    const defaultCrop = {
      unit: '%',
      x: 5,
      y: 5,
      width: 90,
      height: aspectRatio ? 90 : undefined,
      aspect: aspectRatio,
    };
    
    // If no aspect ratio, calculate height based on width to maintain image proportions
    if (!aspectRatio) {
      const cropWidthPercent = 90;
      const cropHeightPercent = (cropWidthPercent * imgHeight) / imgWidth;
      defaultCrop.height = Math.min(cropHeightPercent, 90);
    }
    
    setCrop(defaultCrop);
    // Also set completedCrop so the Apply button is enabled by default
    setCompletedCrop(defaultCrop);
  }, [aspectRatio]);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropComplete = (crop) => {
    // Ensure crop has all required values
    if (crop && crop.x !== undefined && crop.y !== undefined && crop.width !== undefined && crop.height !== undefined) {
      setCompletedCrop(crop);
    }
  };

  const getCroppedImg = (image, crop) => {
    if (!crop || !image) {
      return Promise.reject(new Error('Invalid crop or image'));
    }

    // Validate crop values
    if (crop.x === undefined || crop.y === undefined || crop.width === undefined || crop.height === undefined) {
      return Promise.reject(new Error('Crop values are incomplete'));
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Convert percentage to pixels if needed
    const pixelCrop = {
      x: crop.unit === '%' ? (crop.x / 100) * image.width : crop.x,
      y: crop.unit === '%' ? (crop.y / 100) * image.height : crop.y,
      width: crop.unit === '%' ? (crop.width / 100) * image.width : crop.width,
      height: crop.unit === '%' ? (crop.height / 100) * image.height : crop.height,
    };

    // Ensure values are valid numbers
    if (isNaN(pixelCrop.x) || isNaN(pixelCrop.y) || isNaN(pixelCrop.width) || isNaN(pixelCrop.height)) {
      return Promise.reject(new Error('Invalid crop pixel values'));
    }

    // Ensure positive dimensions
    const outputWidth = Math.max(1, Math.round(pixelCrop.width * scaleX));
    const outputHeight = Math.max(1, Math.round(pixelCrop.height * scaleY));

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return new Promise((resolve, reject) => {
      // Convert to data URL (base64) for persistence in database
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      if (!dataUrl || dataUrl === 'data:,') {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(dataUrl);
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      return;
    }

    try {
      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
      onChange({ target: { name: fieldName, value: croppedImageUrl } });
      setShowCropModal(false);
      setSrc(null);
      setCompletedCrop(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowCropModal(false);
    setSrc(null);
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    onChange({ target: { name: fieldName, value: '' } });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-crop-container">
      <div className="image-upload-input-group">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          disabled={disabled}
          className="file-input"
          id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <div className="image-upload-controls">
          <label 
            htmlFor={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`upload-button ${disabled ? 'disabled' : ''}`}
          >
            📤 Upload Image
          </label>
          <input
            type="url"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="url-input"
          />
          {value && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="remove-button"
              disabled={disabled}
            >
              ✕
            </button>
          )}
        </div>
        {hint && <small className="input-hint">{hint}</small>}
        <div className="image-preview-container">
          {value && (
            <div className="image-preview">
              <img src={value} alt="Preview" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="preview-remove-btn"
                disabled={disabled}
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {showCropModal && src && (
        <div className="crop-modal-overlay" onClick={handleCancel}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-modal-header">
              <h3>Crop {label}</h3>
              <button
                type="button"
                onClick={handleCancel}
                className="crop-modal-close"
              >
                ✕
              </button>
            </div>
            <div className="crop-modal-content">
              {src && (
                <ReactCrop
                  crop={crop}
                  onChange={onCropChange}
                  onComplete={onCropComplete}
                  {...(aspectRatio !== null && aspectRatio !== undefined ? { aspect: aspectRatio } : {})}
                  minWidth={50}
                  minHeight={50}
                >
                  <img
                    src={src}
                    alt="Crop"
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                    onLoad={onImageLoaded}
                  />
                </ReactCrop>
              )}
            </div>
            <div className="crop-modal-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropComplete}
                className="btn-apply"
                disabled={!completedCrop || !imgRef.current}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadCrop;

