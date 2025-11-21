const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

/**
 * Middleware mejorado de seguridad para subida de archivos
 * Protege contra:
 * - Archivos maliciosos
 * - Path traversal attacks
 * - Archivos con extensiones peligrosas
 * - MIME type spoofing
 */

// Extensiones de archivo permitidas (whitelist)
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Tamaño máximo de archivo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Validación estricta de tipo MIME
const validateMimeType = (file) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  // Verificar que la extensión esté en la whitelist
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
    return false;
  }

  // Verificar que el MIME type esté en la whitelist
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return false;
  }

  // Verificar coherencia entre extensión y MIME type
  const expectedMimeTypes = {
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.gif': ['image/gif'],
    '.webp': ['image/webp']
  };

  const expected = expectedMimeTypes[fileExtension];
  if (!expected || !expected.includes(mimeType)) {
    return false;
  }

  return true;
};

// Sanitizar nombre de archivo para prevenir path traversal
const sanitizeFilename = (filename) => {
  // Eliminar caracteres peligrosos y path separators
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Solo permitir caracteres seguros
    .replace(/\.{2,}/g, '_') // Eliminar secuencias de puntos (..)
    .replace(/^\.+/, '') // Eliminar puntos al inicio
    .slice(0, 100); // Limitar longitud

  // Generar nombre único con hash criptográfico
  const hash = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(sanitized);
  const name = path.basename(sanitized, ext);

  return `${name}-${hash}${ext}`;
};

// Configuración de multer con validaciones de seguridad
const storage = multer.memoryStorage(); // Usar memoria para validación antes de guardar

const fileFilter = (req, file, cb) => {
  // Validar MIME type
  if (!validateMimeType(file)) {
    return cb(
      new Error(`Tipo de archivo no permitido. Solo se permiten imágenes: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`),
      false
    );
  }

  // Validar nombre de archivo
  if (!file.originalname || file.originalname.length > 255) {
    return cb(new Error('Nombre de archivo inválido'), false);
  }

  cb(null, true);
};

// Crear configuración de multer segura
const createSecureUpload = (options = {}) => {
  return multer({
    storage,
    limits: {
      fileSize: options.maxSize || MAX_FILE_SIZE,
      files: options.maxFiles || 10
    },
    fileFilter
  });
};

// Middleware para validar archivos después de la subida
const validateUploadedFiles = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || [req.file];

  for (const file of files) {
    // Validación adicional del contenido del archivo (magic bytes)
    if (file.buffer) {
      const magicBytes = file.buffer.slice(0, 4).toString('hex');

      // Validar magic bytes de imágenes comunes
      const validMagicBytes = {
        'ffd8ffe0': 'image/jpeg', // JPEG
        'ffd8ffe1': 'image/jpeg', // JPEG (Exif)
        'ffd8ffe2': 'image/jpeg', // JPEG
        '89504e47': 'image/png',  // PNG
        '47494638': 'image/gif',  // GIF
        '52494646': 'image/webp'  // WEBP (RIFF)
      };

      const isValid = Object.keys(validMagicBytes).some(magic =>
        magicBytes.startsWith(magic)
      );

      if (!isValid) {
        return res.status(400).json({
          error: 'Archivo inválido: El contenido no corresponde a una imagen válida'
        });
      }
    }

    // Sanitizar nombre de archivo
    file.originalname = sanitizeFilename(file.originalname);
  }

  next();
};

// Middleware para limitar número de archivos por request
const limitFilesPerRequest = (maxFiles = 5) => {
  return (req, res, next) => {
    const filesCount = req.files ? req.files.length : (req.file ? 1 : 0);

    if (filesCount > maxFiles) {
      return res.status(400).json({
        error: `No se pueden subir más de ${maxFiles} archivos a la vez`
      });
    }

    next();
  };
};

module.exports = {
  createSecureUpload,
  validateUploadedFiles,
  limitFilesPerRequest,
  sanitizeFilename,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};
