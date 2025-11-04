const router = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isHost } = require('../middleware/roleCheck.middleware');
const multer = require('multer');

// Configurar Multer para usar memoria (no guardar en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite 5MB por imagen
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Todas las rutas requieren autenticación y rol de host
router.use(authenticate);
router.use(isHost);

// Subir una imagen
router.post('/single', upload.single('image'), uploadController.uploadSingle);

// Subir múltiples imágenes (máximo 10)
router.post('/multiple', upload.array('images', 10), uploadController.uploadMultiple);

// Eliminar imagen
router.delete('/delete', uploadController.deleteImage);

module.exports = router;