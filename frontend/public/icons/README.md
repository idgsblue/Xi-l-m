# PWA Icons

## Required Icons

You need to create the following icon sizes for your PWA:

- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels

## How to Generate Icons

### Option 1: Online Tools

You can use free online tools to generate all icon sizes from a single image:

1. **PWA Asset Generator** - https://www.pwabuilder.com/imageGenerator
   - Upload your logo (recommended: 512x512px PNG with transparent background)
   - Download all generated sizes

2. **Favicon Generator** - https://realfavicongenerator.net/
   - Upload your logo
   - Generate all PWA icons

3. **PWA Icon Generator** - https://tools.crawlink.com/tools/pwa-icon-generator/
   - Upload base image
   - Generate PWA icons

### Option 2: Using Image Editing Software

If you have Adobe Photoshop, GIMP, or similar:

1. Create or open your logo
2. Export the logo at each required size
3. Save as PNG with transparent background (recommended)
4. Name files according to the list above

### Option 3: Using Command Line (ImageMagick)

If you have ImageMagick installed:

```bash
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

## Design Recommendations

- Use a **simple, recognizable logo**
- Ensure good contrast for visibility
- Use **transparent background** for flexibility
- Test on both light and dark backgrounds
- Consider the "safe zone" - keep important elements within 80% of the icon area
- Avoid thin lines (they may not render well at smaller sizes)

## Temporary Placeholder

Until you create custom icons, you can use a simple colored square or download free icons from:
- https://icons8.com/
- https://www.flaticon.com/
- https://iconmonstr.com/

## Verification

After placing your icons, you can verify them at:
- https://www.pwabuilder.com/
- Chrome DevTools > Application > Manifest
