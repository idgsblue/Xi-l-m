const router = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isHost } = require('../middleware/roleCheck.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');
const { createSecureUpload, validateUploadedFiles, limitFilesPerRequest } = require('../middleware/fileUpload.middleware');

// Usar el middleware de upload seguro
const secureUpload = createSecureUpload({
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10
});

// Todas las rutas requieren autenticación y rol de host
router.use(authenticate);
router.use(isHost);

// Aplicar rate limiting específico para uploads
router.use(uploadLimiter);

// Subir una imagen con validaciones de seguridad
router.post('/single',
  secureUpload.single('image'),
  validateUploadedFiles,
  limitFilesPerRequest(1),
  uploadController.uploadSingle
);

// Subir múltiples imágenes (máximo 5) con validaciones de seguridad
router.post('/multiple',
  secureUpload.array('images', 5),
  validateUploadedFiles,
  limitFilesPerRequest(5),
  uploadController.uploadMultiple
);

// Eliminar imagen
router.delete('/delete', uploadController.deleteImage);

module.exports = router;