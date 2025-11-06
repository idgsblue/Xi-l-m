#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 *
 * This script generates all required PWA icons from a single source image.
 *
 * Prerequisites:
 * npm install sharp
 *
 * Usage:
 * node generate-icons.js path/to/your/logo.png
 *
 * Requirements:
 * - Source image should be at least 512x512 pixels (higher resolution is better)
 * - Supported formats: PNG, JPG, WEBP, SVG
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Output directory
const OUTPUT_DIR = path.join(__dirname, 'public', 'icons');

/**
 * Generate icons from source image
 */
async function generateIcons(sourcePath) {
  try {
    // Validate source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Error: Source file not found: ${sourcePath}`);
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`✅ Created directory: ${OUTPUT_DIR}`);
    }

    console.log(`\n🎨 Generating PWA icons from: ${sourcePath}\n`);

    // Get source image metadata
    const metadata = await sharp(sourcePath).metadata();
    console.log(`📐 Source image: ${metadata.width}x${metadata.height} ${metadata.format}`);

    if (metadata.width < 512 || metadata.height < 512) {
      console.warn(`\n⚠️  Warning: Source image is smaller than 512x512. Quality may be reduced.`);
      console.warn(`   Recommended: Use an image of at least 1024x1024 for best results.\n`);
    }

    // Generate each icon size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      await sharp(sourcePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated: icon-${size}x${size}.png`);
    }

    console.log(`\n✅ All icons generated successfully in: ${OUTPUT_DIR}`);
    console.log(`\n📱 Your PWA is ready! The manifest.json already references these icons.`);
    console.log(`\nNext steps:`);
    console.log(`1. Review the generated icons in public/icons/`);
    console.log(`2. Test your PWA by running the app and checking the browser's install prompt`);
    console.log(`3. Use Lighthouse to audit your PWA configuration\n`);

  } catch (error) {
    console.error(`\n❌ Error generating icons:`, error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
PWA Icon Generator
==================

Usage: node generate-icons.js <source-image-path>

Example:
  node generate-icons.js logo.png
  node generate-icons.js assets/my-logo.svg

Requirements:
  - Source image should be at least 512x512 pixels (1024x1024 recommended)
  - Supported formats: PNG, JPG, WEBP, SVG

Icons to be generated:
  ${ICON_SIZES.map(size => `${size}x${size}`).join(', ')}

Output directory:
  ${OUTPUT_DIR}
`);
    process.exit(1);
  }

  const sourcePath = path.resolve(args[0]);
  generateIcons(sourcePath);
}

module.exports = { generateIcons };
