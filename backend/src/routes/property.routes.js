const router = require('express').Router();
const propertyController = require('../controllers/property.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isHost } = require('../middleware/roleCheck.middleware');
const { body, query } = require('express-validator');
const handleValidationErrors = require('../middleware/validation.middleware');

// Validaciones
const propertyValidation = [
  body('title')
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 3, max: 255 }).withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('description')
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
  body('location')
    .notEmpty().withMessage('La ubicación es requerida'),
  body('price_per_night')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('La capacidad debe estar entre 1 y 20'),
  body('accommodation_type_id')
    .optional()
    .isInt().withMessage('El tipo de alojamiento debe ser un número válido'),
  body('services')
    .optional()
    .isArray().withMessage('Los servicios deben ser un arreglo'),
  body('images')
    .optional()
    .isArray().withMessage('Las imágenes deben ser un arreglo de URLs')
];

const searchValidation = [
  query('location').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('guests').optional().isInt({ min: 1 }),
  query('accommodation_type_id').optional().isInt(),
  query('checkIn').optional().isISO8601().toDate(),
  query('checkOut').optional().isISO8601().toDate(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
];

// ====================================
// RUTAS PROTEGIDAS PRIMERO (más específicas)
// ====================================
router.post('/', 
  authenticate,  // ← Asegúrate de que authenticate esté aquí
  isHost, 
  propertyValidation, 
  handleValidationErrors, 
  propertyController.create
);

router.get('/host/my-properties', 
  authenticate, 
  isHost, 
  propertyController.getMyProperties
);

router.put('/:id', 
  authenticate,
  isHost,
  propertyValidation, 
  handleValidationErrors, 
  propertyController.update
);

router.delete('/:id', 
  authenticate, 
  isHost, 
  propertyController.delete
);

router.patch('/:id/status',
  authenticate,
  isHost,
  body('status').isIn(['inactive', 'published', 'blocked']).withMessage('Estado inválido'),
  handleValidationErrors,
  propertyController.updateStatus
);

// ====================================
// RUTAS PÚBLICAS AL FINAL (menos específicas)
// ====================================
router.get('/', searchValidation, handleValidationErrors, propertyController.getAll);
router.get('/:id', propertyController.getById);

module.exports = router;