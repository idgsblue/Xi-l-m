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
// RUTAS PROTEGIDAS (HOST) - MÁS ESPECÍFICAS PRIMERO
// ====================================

// Crear propiedad (HOST)
router.post('/', 
  authenticate,
  isHost, 
  propertyValidation, 
  handleValidationErrors, 
  propertyController.create
);

// Obtener mis propiedades (HOST)
router.get('/host/my-properties', 
  authenticate, 
  isHost, 
  propertyController.getMyProperties
);

// NUEVO: Anunciar propiedad (HOST)
router.post('/:id/advertise', 
  authenticate,
  isHost,
  propertyController.advertiseProperty
);

// NUEVO: Despublicar propiedad (HOST)
router.post('/:id/unadvertise', 
  authenticate,
  isHost,
  propertyController.unadvertiseProperty
);

// Actualizar propiedad (HOST)
router.put('/:id', 
  authenticate,
  isHost,
  propertyValidation, 
  handleValidationErrors, 
  propertyController.update
);

// Eliminar propiedad (HOST)
router.delete('/:id', 
  authenticate, 
  isHost, 
  propertyController.delete
);

// Actualizar estado (DEPRECADO - usar advertise/unadvertise)
router.patch('/:id/status',
  authenticate,
  isHost,
  body('status').isIn(['inactive', 'pending_approval', 'approved', 'rejected', 'published', 'blocked']).withMessage('Estado inválido'),
  handleValidationErrors,
  propertyController.updateStatus
);

// ====================================
// RUTAS PÚBLICAS - MENOS ESPECÍFICAS
// ====================================

// Buscar propiedades (PÚBLICO)
router.get('/', 
  searchValidation, 
  handleValidationErrors, 
  propertyController.getAll
);

// Obtener propiedad por ID (PÚBLICO/OWNER/ADMIN)
router.get('/:id', 
  propertyController.getById
);

module.exports = router;