# How to Generate Gumroad Images

## Quick Method (Recommended)

1. **Open the HTML file**:
   - Open `generate-gumroad-images.html` in your web browser
   - You'll see previews of both images

2. **Download the images**:
   - Click "Download Cover Image" button for the 1280x720px cover
   - Click "Download Thumbnail Image" button for the 600x600px thumbnail
   - The images will be saved to your Downloads folder

3. **Upload to Gumroad**:
   - Go to your Gumroad product page
   - Upload `gumroad-cover.png` as the Cover image
   - Upload `gumroad-thumbnail.png` as the Thumbnail image

## Alternative Method (Using Browser Screenshot)

If the download button doesn't work:

1. Open `generate-gumroad-images.html` in your browser
2. Take a screenshot of each image section
3. Crop to exact dimensions:
   - Cover: 1280x720px
   - Thumbnail: 600x600px
4. Save as PNG files

## Image Specifications

### Cover Image
- **Dimensions**: 1280x720px (minimum)
- **Format**: PNG or JPG
- **DPI**: 72 DPI
- **Orientation**: Horizontal (landscape)

### Thumbnail Image
- **Dimensions**: 600x600px (minimum)
- **Format**: JPG, PNG, or GIF
- **Orientation**: Square

## Customization

If you want to customize the images:

1. Edit `generate-gumroad-images.html`
2. Modify the text, colors, or layout in the HTML/CSS
3. Regenerate the images using the download buttons

## Troubleshooting

- **Download button not working**: Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- **Images look blurry**: The script uses 2x scale for quality. If still blurry, try increasing the scale value in the script
- **Wrong dimensions**: The HTML elements are set to exact dimensions. Make sure your browser isn't zoomed in/out



